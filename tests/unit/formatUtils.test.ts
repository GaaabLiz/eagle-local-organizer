import { pluralize, formatProgress } from '../../src/utils/formatUtils';

describe('formatUtils', () => {
  describe('pluralize', () => {
    it('returns singular for count 1', () => {
      expect(pluralize(1, 'file', 'files')).toBe('1 file');
    });

    it('returns plural for count 0', () => {
      expect(pluralize(0, 'file', 'files')).toBe('0 files');
    });

    it('returns plural for count > 1', () => {
      expect(pluralize(5, 'file', 'files')).toBe('5 files');
    });
  });

  describe('formatProgress', () => {
    it('formats progress as percentage', () => {
      expect(formatProgress(3, 10)).toBe(30);
    });

    it('returns 0 for zero total', () => {
      expect(formatProgress(0, 0)).toBe(0);
    });

    it('returns 100 when complete', () => {
      expect(formatProgress(10, 10)).toBe(100);
    });
  });
});
