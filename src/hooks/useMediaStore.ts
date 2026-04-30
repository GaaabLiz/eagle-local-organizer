import { create } from 'zustand';
import type { MediaItem, AddSource } from '../types';
import {
  getSelectedItems,
  getItemsByFolder,
  getItemsByTag,
  eagleItemToMediaItem,
} from '../services/eagleApiService';
import { extractExifCreationDate, extractExifModificationDate } from '../services/metadataService';

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

  fetchSelectedItems: () => Promise<void>;
  fetchItemsByFolder: (folderId: string, folderName: string) => Promise<void>;
  fetchItemsByTag: (tagName: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

/**
 * Enrich a media item with EXIF date data.
 */
function enrichWithExif(item: MediaItem): MediaItem {
  try {
    const exifDate = extractExifCreationDate(item.filePath);
    const exifModDate = extractExifModificationDate(item.filePath);
    return {
      ...item,
      exifDate: exifDate ?? undefined,
      exifModifiedDate: exifModDate ?? undefined,
      hasExif: exifDate !== undefined,
    };
  } catch {
    return item;
  }
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

  fetchSelectedItems: async () => {
    set({ isLoading: true });
    try {
      const eagleItems = await getSelectedItems();
      const mediaItems = eagleItems.map(eagleItemToMediaItem).map(enrichWithExif);
      get().addItems(mediaItems);
      get().setAddSource({ mode: 'selected' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemsByFolder: async (folderId, folderName) => {
    set({ isLoading: true });
    try {
      const eagleItems = await getItemsByFolder(folderId);
      const mediaItems = eagleItems.map(eagleItemToMediaItem).map(enrichWithExif);
      get().addItems(mediaItems);
      get().setAddSource({ mode: 'folder', folderId, folderName });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemsByTag: async (tagName) => {
    set({ isLoading: true });
    try {
      const eagleItems = await getItemsByTag(tagName);
      const mediaItems = eagleItems.map(eagleItemToMediaItem).map(enrichWithExif);
      get().addItems(mediaItems);
      get().setAddSource({ mode: 'tag', tagName });
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
            const mediaItems = eagleItems.map(eagleItemToMediaItem).map(enrichWithExif);
            get().addItems(mediaItems);
          }
          break;
        case 'tag':
          if (source.tagName) {
            const eagleItems = await getItemsByTag(source.tagName);
            const mediaItems = eagleItems.map(eagleItemToMediaItem).map(enrichWithExif);
            get().addItems(mediaItems);
          }
          break;
        case 'selected':
          // For "selected" mode, refresh does nothing per spec
          break;
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
