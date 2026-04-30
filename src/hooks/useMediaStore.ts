import { create } from 'zustand';
import type { MediaItem, AddSource } from '../types';
import {
  getSelectedItems,
  getItemsByFolder,
  getItemsByTag,
  getAllItems,
  eagleItemToMediaItem,
} from '../services/eagleApiService';
import { getCachedPreview, generatePreview } from '../services/thumbnailCacheService';
import {
  findSidecarForItem,
  writeSidecarFile,
  getSidecarTempDir,
  type SidecarCandidate,
} from '../services/sidecarService';
import { logInfo, logError, logWarn } from '../services/logService';
import { useOperationStore } from './useOperationStore';

const BATCH_SIZE = 50; // items per tick to keep UI responsive

export interface SidecarConflict {
  mediaItem: MediaItem;
  candidates: SidecarCandidate[];
}

interface MediaState {
  items: MediaItem[];
  selectedIds: Set<string>;
  addSource: AddSource | null;
  isLoading: boolean;
  sidecarConflicts: SidecarConflict[];

  addItems: (newItems: MediaItem[]) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  setSelected: (ids: Set<string>) => void;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setAddSource: (source: AddSource | null) => void;
  setItems: (items: MediaItem[]) => void;
  updateItem: (id: string, patch: Partial<MediaItem>) => void;

  fetchSelectedItems: (checkForSidecars?: boolean) => Promise<void>;
  fetchItemsByFolder: (folderId: string, folderName: string, checkForSidecars?: boolean) => Promise<void>;
  fetchItemsByTag: (tagName: string, checkForSidecars?: boolean) => Promise<void>;
  refreshItems: () => Promise<void>;

  // Sidecar operations
  removeSidecars: () => void;
  linkSidecarToItem: (mediaId: string, sidecarId: string) => void;
  generateSidecars: (importToEagle: boolean) => Promise<void>;
  resolveSidecarConflict: (mediaId: string, chosenSidecarId: string | null) => void;
  clearSidecarConflicts: () => void;
}

/**
 * Attach cached preview path if already exists (fast, no I/O wait).
 */
function attachCachedPreview(item: MediaItem): MediaItem {
  const cached = getCachedPreview(item.id);
  if (cached) {
    return { ...item, cachedPreviewPath: cached };
  }
  return item;
}

/**
 * Process raw Eagle items in batches, yielding to the event loop
 * between batches so the UI stays responsive.
 * Reports progress via the operation store.
 */
async function processItemsInBatches(
  rawItems: unknown[],
  addItems: (items: MediaItem[]) => void,
): Promise<void> {
  const op = useOperationStore.getState();
  const total = rawItems.length;
  op.startOperation('loading', `Loading ${total} items...`);

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = rawItems.slice(i, i + BATCH_SIZE);
    const mediaItems = batch.map((item) => {
      const media = eagleItemToMediaItem(item as Parameters<typeof eagleItemToMediaItem>[0]);
      return attachCachedPreview(media);
    });

    addItems(mediaItems);

    const processed = Math.min(i + BATCH_SIZE, total);
    const pct = Math.round((processed / total) * 100);
    op.updateProgress(pct, `${processed}/${total}`);

    // Yield to the event loop so the UI can repaint
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  op.completeOperation(`${total} items loaded`);
}

/**
 * Search Eagle for sidecar files matching the loaded media items.
 * Adds found sidecars and links them. Returns conflicts for user resolution.
 */
async function findAndLinkSidecars(
  getItems: () => MediaItem[],
  addItems: (items: MediaItem[]) => void,
  updateItem: (id: string, patch: Partial<MediaItem>) => void,
): Promise<SidecarConflict[]> {
  const op = useOperationStore.getState();
  const mediaItems = getItems().filter((i) => !i.isSidecar && i.type !== 'other');

  if (mediaItems.length === 0) return [];

  op.startOperation('sidecar', 'Searching for sidecar files...');
  logInfo(`Searching sidecars for ${mediaItems.length} media items`);

  let allEagleItems: unknown[];
  try {
    allEagleItems = await getAllItems();
  } catch (err) {
    logError('Failed to fetch all Eagle items for sidecar search', err);
    op.completeOperation('Sidecar search failed: could not access Eagle library');
    return [];
  }

  const conflicts: SidecarConflict[] = [];
  let linked = 0;

  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i];
    const candidates = findSidecarForItem(
      item,
      allEagleItems as Array<{ id: string; name: string; ext: string; filePath: string; size: number; modifiedAt: number; importedAt: number }>
    );

    if (candidates.length === 1) {
      // Single match — auto-link
      const sc = candidates[0];
      const sidecarMedia: MediaItem = {
        id: sc.id,
        name: sc.name,
        ext: sc.ext,
        filePath: sc.filePath,
        tags: [],
        folders: [],
        width: 0,
        height: 0,
        size: sc.size,
        importedAt: sc.modifiedAt,
        modifiedAt: sc.modifiedAt,
        type: 'other',
        hasExif: false,
        isSidecar: true,
        sidecarId: item.id,
      };
      addItems([sidecarMedia]);
      updateItem(item.id, { hasSidecar: true, sidecarId: sc.id });
      linked++;
    } else if (candidates.length > 1) {
      // Multiple matches — user must choose
      conflicts.push({ mediaItem: item, candidates });
      logWarn(`Multiple sidecar candidates for ${item.name}.${item.ext}: ${candidates.length} found`);
    }

    if ((i + 1) % 20 === 0 || i === mediaItems.length - 1) {
      const pct = Math.round(((i + 1) / mediaItems.length) * 100);
      op.updateProgress(pct, `${i + 1}/${mediaItems.length}`);
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }

  const msg = conflicts.length > 0
    ? `Found ${linked} sidecars, ${conflicts.length} need resolution`
    : `${linked} sidecars linked`;
  op.completeOperation(msg);
  logInfo(msg);

  return conflicts;
}

/**
 * Generate preview thumbnails for items in the background.
 * Runs AFTER items are displayed — doesn't block the UI.
 */
function generatePreviewsInBackground(
  getItems: () => MediaItem[],
  updateItem: (id: string, patch: Partial<MediaItem>) => void,
): void {
  const items = getItems().filter(
    (i) => i.type === 'photo' && !i.cachedPreviewPath
  );
  if (items.length === 0) return;

  let idx = 0;
  const PREVIEW_BATCH = 5; // concurrent preview generations

  function nextBatch() {
    const batch = items.slice(idx, idx + PREVIEW_BATCH);
    idx += PREVIEW_BATCH;
    if (batch.length === 0) return;

    Promise.all(
      batch.map((item) =>
        generatePreview(item).then((cachePath) => {
          if (cachePath) {
            updateItem(item.id, { cachedPreviewPath: cachePath });
          }
        })
      )
    ).then(() => {
      if (idx < items.length) {
        setTimeout(nextBatch, 10);
      }
    });
  }

  // Start after a small delay so table renders first
  setTimeout(nextBatch, 100);
}

export const useMediaStore = create<MediaState>((set, get) => ({
  items: [],
  selectedIds: new Set<string>(),
  addSource: null,
  isLoading: false,
  sidecarConflicts: [],

  addItems: (newItems) => {
    set((state) => {
      const existingIds = new Set(state.items.map((i) => i.id));
      const unique = newItems.filter((i) => !existingIds.has(i.id));
      if (unique.length === 0) return state;
      return { items: [...state.items, ...unique] };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      newSelected.delete(id);
      // Also unlink sidecar relationships
      const removedItem = state.items.find((i) => i.id === id);
      let updatedItems = state.items.filter((i) => i.id !== id);
      if (removedItem?.sidecarId) {
        updatedItems = updatedItems.map((i) =>
          i.id === removedItem.sidecarId
            ? { ...i, sidecarId: undefined, hasSidecar: false }
            : i
        );
      }
      return { items: updatedItems, selectedIds: newSelected };
    });
  },

  clearAll: () => {
    set({ items: [], selectedIds: new Set(), addSource: null, sidecarConflicts: [] });
  },

  setSelected: (ids) => {
    set({ selectedIds: ids });
  },

  toggleSelected: (id) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedIds: newSelected };
    });
  },

  selectAll: () => {
    set((state) => ({
      selectedIds: new Set(state.items.map((i) => i.id)),
    }));
  },

  deselectAll: () => {
    set({ selectedIds: new Set() });
  },

  setAddSource: (source) => {
    set({ addSource: source });
  },

  setItems: (items) => {
    set({ items });
  },

  updateItem: (id, patch) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  },

  // --- Sidecar operations ---

  removeSidecars: () => {
    set((state) => {
      const sidecarIds = new Set(
        state.items.filter((i) => i.isSidecar).map((i) => i.id)
      );
      // Remove sidecars and unlink from media
      const updatedItems = state.items
        .filter((i) => !i.isSidecar)
        .map((i) =>
          i.hasSidecar && i.sidecarId && sidecarIds.has(i.sidecarId)
            ? { ...i, hasSidecar: false, sidecarId: undefined }
            : i
        );
      const newSelected = new Set(state.selectedIds);
      for (const id of sidecarIds) {
        newSelected.delete(id);
      }
      logInfo(`Removed ${sidecarIds.size} sidecar(s) from plugin`);
      return { items: updatedItems, selectedIds: newSelected };
    });
  },

  linkSidecarToItem: (mediaId, sidecarId) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === mediaId) {
          return { ...item, hasSidecar: true, sidecarId };
        }
        if (item.id === sidecarId) {
          return { ...item, sidecarId: mediaId };
        }
        return item;
      }),
    }));
    logInfo(`Linked sidecar ${sidecarId} to media ${mediaId}`);
  },

  generateSidecars: async (importToEagle) => {
    const op = useOperationStore.getState();
    const items = get().items.filter(
      (i) => !i.isSidecar && (i.type === 'photo' || i.type === 'video') && !i.hasSidecar
    );

    if (items.length === 0) {
      op.startOperation('sidecar', 'No items need sidecars');
      op.completeOperation('All media items already have sidecars');
      return;
    }

    op.startOperation('sidecar', `Generating ${items.length} sidecars...`);
    logInfo(`Generating sidecars for ${items.length} items (importToEagle: ${importToEagle})`);

    const outputDir = importToEagle ? undefined : getSidecarTempDir();
    let generated = 0;
    let errors = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const result = writeSidecarFile(item, outputDir);

      if (result) {
        // Create a MediaItem for the sidecar and add it to the store
        const sidecarItem: MediaItem = {
          id: `sidecar-${item.id}-${Date.now()}`,
          name: item.name,
          ext: 'xmp',
          filePath: result.filePath,
          tags: [],
          folders: [],
          width: 0,
          height: 0,
          size: 0, // Will be updated
          importedAt: Date.now(),
          modifiedAt: Date.now(),
          type: 'other',
          hasExif: false,
          isSidecar: true,
          sidecarId: item.id,
        };

        get().addItems([sidecarItem]);
        get().updateItem(item.id, { hasSidecar: true, sidecarId: sidecarItem.id });
        generated++;

        if (importToEagle) {
          // TODO: Import to Eagle when API supports it
          logWarn(`Eagle import not yet implemented for: ${result.fileName}`);
        }
      } else {
        errors++;
      }

      const pct = Math.round(((i + 1) / items.length) * 100);
      op.updateProgress(pct, `${item.name}.xmp`);

      // Yield to keep UI responsive
      if ((i + 1) % 10 === 0) {
        await new Promise<void>((r) => setTimeout(r, 0));
      }
    }

    const msg = errors > 0
      ? `Generated ${generated} sidecars, ${errors} failed`
      : `Generated ${generated} sidecars successfully`;
    op.completeOperation(msg);
    logInfo(msg);
  },

  resolveSidecarConflict: (mediaId, chosenSidecarId) => {
    if (chosenSidecarId) {
      // Find the candidate and add it
      const conflict = get().sidecarConflicts.find((c) => c.mediaItem.id === mediaId);
      if (conflict) {
        const chosen = conflict.candidates.find((c) => c.id === chosenSidecarId);
        if (chosen) {
          const sidecarMedia: MediaItem = {
            id: chosen.id,
            name: chosen.name,
            ext: chosen.ext,
            filePath: chosen.filePath,
            tags: [],
            folders: [],
            width: 0,
            height: 0,
            size: chosen.size,
            importedAt: chosen.modifiedAt,
            modifiedAt: chosen.modifiedAt,
            type: 'other',
            hasExif: false,
            isSidecar: true,
            sidecarId: mediaId,
          };
          get().addItems([sidecarMedia]);
          get().updateItem(mediaId, { hasSidecar: true, sidecarId: chosen.id });
          logInfo(`Conflict resolved: linked ${chosen.name}.${chosen.ext} to ${mediaId}`);
        }
      }
    }

    // Remove the resolved conflict
    set((state) => ({
      sidecarConflicts: state.sidecarConflicts.filter((c) => c.mediaItem.id !== mediaId),
    }));
  },

  clearSidecarConflicts: () => {
    set({ sidecarConflicts: [] });
  },

  // --- Fetch operations ---

  fetchSelectedItems: async (checkForSidecars = false) => {
    set({ isLoading: true });
    try {
      const eagleItems = await getSelectedItems();
      await processItemsInBatches(eagleItems, get().addItems);
      get().setAddSource({ mode: 'selected' });

      if (checkForSidecars) {
        const conflicts = await findAndLinkSidecars(
          () => get().items,
          get().addItems,
          get().updateItem,
        );
        if (conflicts.length > 0) {
          set({ sidecarConflicts: conflicts });
        }
      }

      generatePreviewsInBackground(
        () => get().items,
        get().updateItem,
      );
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemsByFolder: async (folderId, folderName, checkForSidecars = false) => {
    set({ isLoading: true });
    try {
      const eagleItems = await getItemsByFolder(folderId);
      await processItemsInBatches(eagleItems, get().addItems);
      get().setAddSource({ mode: 'folder', folderId, folderName });

      if (checkForSidecars) {
        const conflicts = await findAndLinkSidecars(
          () => get().items,
          get().addItems,
          get().updateItem,
        );
        if (conflicts.length > 0) {
          set({ sidecarConflicts: conflicts });
        }
      }

      generatePreviewsInBackground(
        () => get().items,
        get().updateItem,
      );
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemsByTag: async (tagName, checkForSidecars = false) => {
    set({ isLoading: true });
    try {
      const eagleItems = await getItemsByTag(tagName);
      await processItemsInBatches(eagleItems, get().addItems);
      get().setAddSource({ mode: 'tag', tagName });

      if (checkForSidecars) {
        const conflicts = await findAndLinkSidecars(
          () => get().items,
          get().addItems,
          get().updateItem,
        );
        if (conflicts.length > 0) {
          set({ sidecarConflicts: conflicts });
        }
      }

      generatePreviewsInBackground(
        () => get().items,
        get().updateItem,
      );
    } finally {
      set({ isLoading: false });
    }
  },

  refreshItems: async () => {
    const source = get().addSource;
    if (!source) return;

    set({ isLoading: true });
    try {
      switch (source.mode) {
        case 'folder':
          if (source.folderId) {
            const eagleItems = await getItemsByFolder(source.folderId);
            await processItemsInBatches(eagleItems, get().addItems);
          }
          break;
        case 'tag':
          if (source.tagName) {
            const eagleItems = await getItemsByTag(source.tagName);
            await processItemsInBatches(eagleItems, get().addItems);
          }
          break;
        case 'selected':
          break;
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
