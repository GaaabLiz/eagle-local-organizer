import { computeDestinationPaths, computeAllDestinations, getPrimaryDestination } from '../../src/services/exportService';
import { createMockMediaItem, createMockSettings } from '../mocks/testData';

// Mock the fs and path modules
jest.mock('fs');
jest.mock('path', () => {
  const actual = jest.requireActual('path') as typeof import('path');
  return {
    ...actual,
    join: (...args: string[]) => args.join('/'),
  };
});

// Mock metadataService
jest.mock('../../src/services/metadataService', () => ({
  getCreationDate: (item: { importedAt: number }) => item.importedAt,
}));

describe('exportService', () => {
  describe('computeDestinationPaths', () => {
    it('year-month structure', () => {
      const item = createMockMediaItem({
        importedAt: new Date('2024-06-15T10:00:00Z').getTime(),
      });
      const settings = createMockSettings({ folderStructure: 'year-month' });
      const paths = computeDestinationPaths(item, settings);
      expect(paths).toHaveLength(1);
      expect(paths[0]).toContain('2024');
      expect(paths[0]).toContain('06');
    });

    it('year-month-day structure', () => {
      const item = createMockMediaItem({
        importedAt: new Date('2024-06-15T10:00:00Z').getTime(),
      });
      const settings = createMockSettings({ folderStructure: 'year-month-day' });
      const paths = computeDestinationPaths(item, settings);
      expect(paths).toHaveLength(1);
      expect(paths[0]).toContain('2024');
      expect(paths[0]).toContain('06');
      expect(paths[0]).toContain('15');
    });

    it('tag structure returns one path per tag', () => {
      const item = createMockMediaItem({
        tags: ['vacation', 'summer'],
      });
      const settings = createMockSettings({ folderStructure: 'tag' });
      const paths = computeDestinationPaths(item, settings);
      expect(paths).toHaveLength(2);
      expect(paths[0]).toContain('vacation');
      expect(paths[1]).toContain('summer');
    });

    it('tag structure returns Untagged for items with no tags', () => {
      const item = createMockMediaItem({ tags: [] });
      const settings = createMockSettings({ folderStructure: 'tag' });
      const paths = computeDestinationPaths(item, settings);
      expect(paths).toHaveLength(1);
      expect(paths[0]).toContain('Untagged');
    });

    it('none structure returns base path', () => {
      const item = createMockMediaItem();
      const settings = createMockSettings({ folderStructure: 'none' });
      const paths = computeDestinationPaths(item, settings);
      expect(paths).toHaveLength(1);
      expect(paths[0]).toBe(settings.exportDestination);
    });
  });

  describe('computeAllDestinations', () => {
    it('adds destinationPath to each item', () => {
      const items = [
        createMockMediaItem({ id: 'a' }),
        createMockMediaItem({ id: 'b' }),
      ];
      const settings = createMockSettings({ folderStructure: 'none' });
      const result = computeAllDestinations(items, settings);
      expect(result).toHaveLength(2);
      result.forEach((item) => {
        expect(item.destinationPath).toBe(settings.exportDestination);
      });
    });
  });

  describe('getPrimaryDestination', () => {
    it('returns the first destination path', () => {
      const item = createMockMediaItem({
        importedAt: new Date('2024-06-15T10:00:00Z').getTime(),
      });
      const result = getPrimaryDestination(item, 'year-month', '/tmp/export');
      expect(result).toContain('2024');
      expect(result).toContain('06');
    });

    it('falls back to exportDestination if no paths', () => {
      const item = createMockMediaItem();
      const result = getPrimaryDestination(item, 'none', '/tmp/export');
      expect(result).toBe('/tmp/export');
    });
  });
});
