import { create } from 'zustand';
import type { MediaItem, AddSource } from '../types';
import {
  getSelectedItems,
  getItemsByFolder,
  getItemsByTag,
  eagleItemToMediaItem,
} from '../services/eagleApiService';
import { getCachedPreview, generatePreview } from '../services/thumbnailCacheService';
import { useOperationStore } from './useOperationStore';

const BATCH_SIZE = 50; // items per tick to keep UI responsive

interface MediaState {
  items: MediaItem[];
  selectedIds: Set<string>;
  addSource: AddSource | null;
  isLoading: boolean;

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

  fetchSelectedItems: () => Promise<void>;
  fetchItemsByFolder: (folderId: string, folderName: string) => Promise<void>;
  fetchItemsByTag: (tagName: string) => Promise<void>;
  refreshItems: () => Promise<void>;
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
      return {
        items: state.items.filter((i) => i.id !== id),
        selectedIds: newSelected,
      };
    });
  },

  clearAll: () => {
    set({ items: [], selectedIds: new Set(), addSource: null });
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

  fetchSelectedItems: async () => {
    set({ isLoading: true });
    try {
      const eagleItems = await getSelectedItems();
      await processItemsInBatches(eagleItems, get().addItems);
      get().setAddSource({ mode: 'selected' });
      generatePreviewsInBackground(
        () => get().items,
        get().updateItem,
      );
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemsByFolder: async (folderId, folderName) => {
    set({ isLoading: true });
    try {
      const eagleItems = await getItemsByFolder(folderId);
      await processItemsInBatches(eagleItems, get().addItems);
      get().setAddSource({ mode: 'folder', folderId, folderName });
      generatePreviewsInBackground(
        () => get().items,
        get().updateItem,
      );
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemsByTag: async (tagName) => {
    set({ isLoading: true });
    try {
      const eagleItems = await getItemsByTag(tagName);
      await processItemsInBatches(eagleItems, get().addItems);
      get().setAddSource({ mode: 'tag', tagName });
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
