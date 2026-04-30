import { findSidecarForItem, generateXmpContent, parseSidecarMetadata } from '../../src/services/sidecarService';
import { createMockMediaItem } from '../mocks/testData';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock logService
jest.mock('../../src/services/logService', () => ({
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logError: jest.fn(),
}));

// Mock eagleApiService
jest.mock('../../src/services/eagleApiService', () => ({
  getPluginPath: () => '/tmp/test-plugin',
}));

// Mock metadataService
jest.mock('../../src/services/metadataService', () => ({
  getAllMetadata: (item: any) => ({
    eagleImportedAt: item.importedAt,
    eagleModifiedAt: item.modifiedAt,
    imageWidth: item.width,
    imageHeight: item.height,
    cameraMake: 'TestMake',
    cameraModel: 'TestModel',
  }),
}));

describe('sidecarService', () => {
  describe('findSidecarForItem', () => {
    const allEagleItems = [
      { id: 'sc1', name: 'photo', ext: 'xmp', filePath: '/test/photo.xmp', size: 1024, modifiedAt: 1000, importedAt: 1000 },
      { id: 'sc2', name: 'photo.jpg', ext: 'xmp', filePath: '/test/photo.jpg.xmp', size: 2048, modifiedAt: 2000, importedAt: 2000 },
      { id: 'sc3', name: 'other', ext: 'xmp', filePath: '/test/other.xmp', size: 512, modifiedAt: 500, importedAt: 500 },
      { id: 'sc4', name: 'photo', ext: 'jpg', filePath: '/test/photo2.jpg', size: 500000, modifiedAt: 3000, importedAt: 3000 },
    ];

    it('should find sidecar by base name match', () => {
      const item = createMockMediaItem({ name: 'photo', ext: 'jpg' });
      const result = findSidecarForItem(item, allEagleItems);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((c) => c.id === 'sc1')).toBe(true);
    });

    it('should find sidecar by full name match (photo.jpg.xmp)', () => {
      const item = createMockMediaItem({ name: 'photo', ext: 'jpg' });
      const result = findSidecarForItem(item, allEagleItems);
      expect(result.some((c) => c.id === 'sc2')).toBe(true);
    });

    it('should not match non-sidecar items', () => {
      const item = createMockMediaItem({ name: 'photo', ext: 'jpg' });
      const result = findSidecarForItem(item, allEagleItems);
      expect(result.some((c) => c.id === 'sc4')).toBe(false);
    });

    it('should return empty for no matches', () => {
      const item = createMockMediaItem({ name: 'landscape', ext: 'png' });
      const result = findSidecarForItem(item, allEagleItems);
      expect(result).toHaveLength(0);
    });

    it('should be case-insensitive', () => {
      const item = createMockMediaItem({ name: 'PHOTO', ext: 'JPG' });
      const result = findSidecarForItem(item, allEagleItems);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateXmpContent', () => {
    it('should generate valid XMP XML', () => {
      const item = createMockMediaItem({
        name: 'test',
        ext: 'jpg',
        tags: ['nature', 'landscape'],
      });
      const xmp = generateXmpContent(item);
      expect(xmp).toContain('x:xmpmeta');
      expect(xmp).toContain('dc:title');
      expect(xmp).toContain('test');
    });

    it('should include tags as dc:subject', () => {
      const item = createMockMediaItem({ tags: ['tag1', 'tag2'] });
      const xmp = generateXmpContent(item);
      expect(xmp).toContain('dc:subject');
      expect(xmp).toContain('tag1');
      expect(xmp).toContain('tag2');
    });
  });

  describe('parseSidecarMetadata', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sidecar-test-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should parse XMP fields from a sidecar file', () => {
      const xmpContent = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:tiff="http://ns.adobe.com/tiff/1.0/">
      <dc:title>My Photo</dc:title>
      <xmp:CreateDate>2024-01-15T10:30:00</xmp:CreateDate>
      <tiff:Make>Canon</tiff:Make>
      <tiff:Model>EOS R5</tiff:Model>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`;

      const filePath = path.join(tmpDir, 'test.xmp');
      fs.writeFileSync(filePath, xmpContent);

      const result = parseSidecarMetadata(filePath);
      expect(result).toBeDefined();
      expect(result!.title).toBe('My Photo');
      expect(result!.createDate).toBe('2024-01-15T10:30:00');
      expect(result!.make).toBe('Canon');
      expect(result!.model).toBe('EOS R5');
    });

    it('should return undefined for non-existent file', () => {
      const result = parseSidecarMetadata('/nonexistent/file.xmp');
      expect(result).toBeUndefined();
    });

    it('should parse subjects from rdf:Bag', () => {
      const xmpContent = `<?xpacket begin="">
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:subject>
        <rdf:Bag>
          <rdf:li>nature</rdf:li>
          <rdf:li>landscape</rdf:li>
        </rdf:Bag>
      </dc:subject>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`;

      const filePath = path.join(tmpDir, 'tags.xmp');
      fs.writeFileSync(filePath, xmpContent);

      const result = parseSidecarMetadata(filePath);
      expect(result).toBeDefined();
      expect(result!.subjects).toBe('nature, landscape');
    });
  });
});
