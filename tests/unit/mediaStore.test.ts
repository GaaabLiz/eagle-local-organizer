import { useMediaStore } from '../../src/hooks/useMediaStore';
import { createMockMediaItem } from '../mocks/testData';

// Mock services that useMediaStore imports
jest.mock('../../src/services/eagleApiService', () => ({
  getSelectedItems: jest.fn().mockResolvedValue([]),
  getItemsByFolder: jest.fn().mockResolvedValue([]),
  getItemsByTag: jest.fn().mockResolvedValue([]),
  eagleItemToMediaItem: jest.fn((item: Record<string, unknown>) => item),
}));

jest.mock('../../src/services/metadataService', () => ({
  extractExifCreationDate: jest.fn().mockReturnValue(undefined),
  extractExifModificationDate: jest.fn().mockReturnValue(undefined),
}));

describe('useMediaStore', () => {
  beforeEach(() => {
    useMediaStore.getState().clearAll();
  });

  it('starts with empty state', () => {
    const state = useMediaStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.selectedIds.size).toBe(0);
    expect(state.addSource).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('adds items without duplicates', () => {
    const item1 = createMockMediaItem({ id: 'a' });
    const item2 = createMockMediaItem({ id: 'b' });

    useMediaStore.getState().addItems([item1, item2]);
    expect(useMediaStore.getState().items).toHaveLength(2);

    // Adding duplicate
    useMediaStore.getState().addItems([item1]);
    expect(useMediaStore.getState().items).toHaveLength(2);
  });

  it('removes an item', () => {
    const item = createMockMediaItem({ id: 'x' });
    useMediaStore.getState().addItems([item]);
    useMediaStore.getState().removeItem('x');
    expect(useMediaStore.getState().items).toHaveLength(0);
  });

  it('removes item from selectedIds when removed', () => {
    const item = createMockMediaItem({ id: 'x' });
    useMediaStore.getState().addItems([item]);
    useMediaStore.getState().setSelected(new Set(['x']));
    useMediaStore.getState().removeItem('x');
    expect(useMediaStore.getState().selectedIds.has('x')).toBe(false);
  });

  it('clears all', () => {
    useMediaStore.getState().addItems([createMockMediaItem()]);
    useMediaStore.getState().clearAll();
    expect(useMediaStore.getState().items).toHaveLength(0);
    expect(useMediaStore.getState().addSource).toBeNull();
  });

  it('toggles selection', () => {
    const item = createMockMediaItem({ id: 'a' });
    useMediaStore.getState().addItems([item]);

    useMediaStore.getState().toggleSelected('a');
    expect(useMediaStore.getState().selectedIds.has('a')).toBe(true);

    useMediaStore.getState().toggleSelected('a');
    expect(useMediaStore.getState().selectedIds.has('a')).toBe(false);
  });

  it('selects all items', () => {
    useMediaStore.getState().addItems([
      createMockMediaItem({ id: 'a' }),
      createMockMediaItem({ id: 'b' }),
    ]);
    useMediaStore.getState().selectAll();
    expect(useMediaStore.getState().selectedIds.size).toBe(2);
  });

  it('deselects all items', () => {
    useMediaStore.getState().addItems([createMockMediaItem({ id: 'a' })]);
    useMediaStore.getState().selectAll();
    useMediaStore.getState().deselectAll();
    expect(useMediaStore.getState().selectedIds.size).toBe(0);
  });

  it('sets add source', () => {
    useMediaStore.getState().setAddSource({ mode: 'folder', folderId: '1', folderName: 'Test' });
    expect(useMediaStore.getState().addSource).toEqual({
      mode: 'folder',
      folderId: '1',
      folderName: 'Test',
    });
  });
});
