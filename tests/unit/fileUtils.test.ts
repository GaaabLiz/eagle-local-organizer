import { formatFileSize, sanitizeFilename, buildUniqueFilename, generateId } from '../../src/utils/fileUtils';

describe('fileUtils', () => {
  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1024 * 1024 * 5)).toBe('5.0 MB');
    });

    it('formats gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB');
    });
  });

  describe('sanitizeFilename', () => {
    it('removes invalid characters', () => {
      expect(sanitizeFilename('file<>:"/\\|?*name')).toBe('file_________name');
    });

    it('preserves valid characters', () => {
      expect(sanitizeFilename('my-photo_2024 (1)')).toBe('my-photo_2024 (1)');
    });

    it('handles empty string', () => {
      expect(sanitizeFilename('')).toBe('');
    });
  });

  describe('buildUniqueFilename', () => {
    it('returns base path when no collision', () => {
      const result = buildUniqueFilename('/dest', 'photo', 'jpg', () => false);
      expect(result).toContain('photo.jpg');
    });

    it('appends counter when file exists', () => {
      let callCount = 0;
      const check = () => {
        callCount++;
        return callCount <= 1;
      };
      const result = buildUniqueFilename('/dest', 'photo', 'jpg', check);
      expect(result).toContain('photo (1).jpg');
    });

    it('increments counter for multiple collisions', () => {
      let callCount = 0;
      const check = () => {
        callCount++;
        return callCount <= 3;
      };
      const result = buildUniqueFilename('/dest', 'photo', 'jpg', check);
      expect(result).toContain('photo (3).jpg');
    });
  });

  describe('generateId', () => {
    it('generates a non-empty string', () => {
      const id = generateId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });
});
