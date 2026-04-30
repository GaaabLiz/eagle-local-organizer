import { getMediaType, PHOTO_EXTENSIONS, VIDEO_EXTENSIONS } from '../../src/types';

describe('types/index', () => {
  describe('getMediaType', () => {
    it('identifies photo extensions', () => {
      expect(getMediaType('jpg')).toBe('photo');
      expect(getMediaType('JPG')).toBe('photo');
      expect(getMediaType('png')).toBe('photo');
      expect(getMediaType('heic')).toBe('photo');
      expect(getMediaType('raw')).toBe('photo');
    });

    it('identifies video extensions', () => {
      expect(getMediaType('mp4')).toBe('video');
      expect(getMediaType('MP4')).toBe('video');
      expect(getMediaType('mov')).toBe('video');
      expect(getMediaType('mkv')).toBe('video');
    });

    it('returns other for unknown extensions', () => {
      expect(getMediaType('pdf')).toBe('other');
      expect(getMediaType('txt')).toBe('other');
      expect(getMediaType('xyz')).toBe('other');
    });
  });

  describe('PHOTO_EXTENSIONS', () => {
    it('contains common photo formats', () => {
      expect(PHOTO_EXTENSIONS.has('jpg')).toBe(true);
      expect(PHOTO_EXTENSIONS.has('png')).toBe(true);
      expect(PHOTO_EXTENSIONS.has('webp')).toBe(true);
    });
  });

  describe('VIDEO_EXTENSIONS', () => {
    it('contains common video formats', () => {
      expect(VIDEO_EXTENSIONS.has('mp4')).toBe(true);
      expect(VIDEO_EXTENSIONS.has('mov')).toBe(true);
      expect(VIDEO_EXTENSIONS.has('avi')).toBe(true);
    });
  });
});
