import type { MediaItem, PluginSettings } from '../../src/types';

/**
 * Create a mock MediaItem with sensible defaults.
 */
export function createMockMediaItem(
  overrides: Partial<MediaItem> = {}
): MediaItem {
  return {
    id: `item-${Math.random().toString(36).substring(2, 9)}`,
    name: 'test-photo',
    ext: 'jpg',
    filePath: '/tmp/test-eagle-library/test-photo.jpg',
    tags: [],
    folders: [],
    width: 1920,
    height: 1080,
    size: 1024 * 500,
    importedAt: new Date('2024-06-15T10:00:00Z').getTime(),
    modifiedAt: new Date('2024-06-15T12:00:00Z').getTime(),
    type: 'photo',
    hasExif: false,
    ...overrides,
  };
}

/**
 * Create multiple mock media items.
 */
export function createMockMediaItems(count: number): MediaItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockMediaItem({
      id: `item-${i}`,
      name: `photo-${i.toString().padStart(3, '0')}`,
      importedAt: new Date(`2024-${(i % 12 + 1).toString().padStart(2, '0')}-${(i % 28 + 1).toString().padStart(2, '0')}T10:00:00Z`).getTime(),
      tags: i % 3 === 0 ? ['vacation'] : i % 3 === 1 ? ['family'] : ['work'],
    })
  );
}

/**
 * Create a mock video item.
 */
export function createMockVideoItem(
  overrides: Partial<MediaItem> = {}
): MediaItem {
  return createMockMediaItem({
    name: 'test-video',
    ext: 'mp4',
    type: 'video',
    size: 1024 * 1024 * 50,
    ...overrides,
  });
}

/**
 * Create default plugin settings.
 */
export function createMockSettings(
  overrides: Partial<PluginSettings> = {}
): PluginSettings {
  return {
    exportDestination: '/tmp/test-export',
    folderStructure: 'year-month',
    dryRun: false,
    importSidecars: false,
    ...overrides,
  };
}

/**
 * Create a mock Eagle API item (raw from eagle.item.get).
 */
export function createMockEagleItem(overrides: Record<string, unknown> = {}) {
  return {
    id: `eagle-item-${Math.random().toString(36).substring(2, 9)}`,
    name: 'eagle-photo',
    ext: 'jpg',
    filePath: '/tmp/test-eagle-library/eagle-photo.jpg',
    fileURL: 'file:///tmp/test-eagle-library/eagle-photo.jpg',
    width: 1920,
    height: 1080,
    size: 512000,
    tags: ['nature'],
    folders: ['folder-1'],
    importedAt: Date.now(),
    modifiedAt: Date.now(),
    star: 3,
    annotation: '',
    metadataFilePath: '/tmp/test-eagle-library/metadata.json',
    ...overrides,
  };
}
