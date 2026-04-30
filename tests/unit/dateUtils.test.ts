import { formatDate, formatDateTime, getYear, getMonth, getDay } from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  const testTimestamp = new Date('2024-06-15T14:30:00Z').getTime();

  describe('formatDate', () => {
    it('formats a valid timestamp', () => {
      const result = formatDate(testTimestamp);
      expect(result).toContain('2024');
      expect(result).toContain('06');
      expect(result).toContain('15');
    });

    it('returns dash for zero timestamp', () => {
      expect(formatDate(0)).toBe('—');
    });

    it('returns dash for negative timestamp', () => {
      expect(formatDate(-1)).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('formats a valid timestamp with time', () => {
      const result = formatDateTime(testTimestamp);
      expect(result).toContain('2024');
    });

    it('returns dash for zero timestamp', () => {
      expect(formatDateTime(0)).toBe('—');
    });
  });

  describe('getYear', () => {
    it('extracts year from timestamp', () => {
      expect(getYear(testTimestamp)).toBe('2024');
    });
  });

  describe('getMonth', () => {
    it('extracts zero-padded month', () => {
      expect(getMonth(testTimestamp)).toBe('06');
    });

    it('zero-pads single-digit months', () => {
      const jan = new Date('2024-01-15T10:00:00Z').getTime();
      expect(getMonth(jan)).toBe('01');
    });
  });

  describe('getDay', () => {
    it('extracts zero-padded day', () => {
      expect(getDay(testTimestamp)).toBe('15');
    });

    it('zero-pads single-digit days', () => {
      const day3 = new Date('2024-06-03T10:00:00Z').getTime();
      expect(getDay(day3)).toBe('03');
    });
  });
});
