/**
 * Integration tests: media store + export service working together.
 */
import { useMediaStore } from '../../src/hooks/useMediaStore';
import { useOperationStore } from '../../src/hooks/useOperationStore';
import { computeDestinationPaths } from '../../src/services/exportService';
import { createMockMediaItem, createMockSettings } from '../mocks/testData';

jest.mock('fs');
jest.mock('path', () => {
  const actual = jest.requireActual('path') as typeof import('path');
  return { ...actual, join: (...args: string[]) => args.join('/') };
});
jest.mock('../../src/services/eagleApiService', () => ({
  getSelectedItems: jest.fn().mockResolvedValue([]),
  getItemsByFolder: jest.fn().mockResolvedValue([]),
  getItemsByTag: jest.fn().mockResolvedValue([]),
  eagleItemToMediaItem: jest.fn((item: Record<string, unknown>) => item),
}));
jest.mock('../../src/services/metadataService', () => ({
  getCreationDate: (item: { importedAt: number }) => item.importedAt,
  extractExifCreationDate: jest.fn().mockReturnValue(undefined),
  extractExifModificationDate: jest.fn().mockReturnValue(undefined),
}));

describe('Integration: Export workflow', () => {
  beforeEach(() => {
    useMediaStore.getState().clearAll();
    useOperationStore.getState().reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds items to store and computes destinations', () => {
    const items = [
      createMockMediaItem({
        id: 'a',
        importedAt: new Date('2024-03-15T10:00:00Z').getTime(),
        tags: ['nature'],
      }),
      createMockMediaItem({
        id: 'b',
        importedAt: new Date('2024-06-20T10:00:00Z').getTime(),
        tags: ['urban'],
      }),
    ];

    useMediaStore.getState().addItems(items);
    expect(useMediaStore.getState().items).toHaveLength(2);

    const settings = createMockSettings({ folderStructure: 'year-month' });
    const paths1 = computeDestinationPaths(items[0], settings);
    const paths2 = computeDestinationPaths(items[1], settings);

    expect(paths1[0]).toContain('2024');
    expect(paths1[0]).toContain('03');
    expect(paths2[0]).toContain('2024');
    expect(paths2[0]).toContain('06');
  });

  it('tag structure creates multiple destinations for multi-tagged items', () => {
    const item = createMockMediaItem({
      id: 'multi',
      tags: ['vacation', 'summer', 'beach'],
    });

    useMediaStore.getState().addItems([item]);
    const settings = createMockSettings({ folderStructure: 'tag' });
    const paths = computeDestinationPaths(item, settings);

    expect(paths).toHaveLength(3);
    expect(paths[0]).toContain('vacation');
    expect(paths[1]).toContain('summer');
    expect(paths[2]).toContain('beach');
  });

  it('operation store tracks export lifecycle', () => {
    useOperationStore.getState().startOperation('export', 'Exporting 5 files...');
    expect(useOperationStore.getState().isRunning).toBe(true);
    expect(useOperationStore.getState().type).toBe('export');

    useOperationStore.getState().updateProgress(60, 'photo-003.jpg');
    expect(useOperationStore.getState().progress).toBe(60);

    useOperationStore.getState().completeOperation('5 files exported');
    expect(useOperationStore.getState().isRunning).toBe(false);
    expect(useOperationStore.getState().completionMessage).toBe('5 files exported');

    jest.advanceTimersByTime(4000);
    expect(useOperationStore.getState().type).toBe('idle');
    expect(useOperationStore.getState().completionMessage).toBe('');
  });

  it('selected items are removed correctly during editing', () => {
    const items = [
      createMockMediaItem({ id: 'a' }),
      createMockMediaItem({ id: 'b' }),
      createMockMediaItem({ id: 'c' }),
    ];

    useMediaStore.getState().addItems(items);
    useMediaStore.getState().selectAll();
    expect(useMediaStore.getState().selectedIds.size).toBe(3);

    useMediaStore.getState().removeItem('b');
    expect(useMediaStore.getState().items).toHaveLength(2);
    expect(useMediaStore.getState().selectedIds.size).toBe(2);
    expect(useMediaStore.getState().selectedIds.has('b')).toBe(false);
  });
});
