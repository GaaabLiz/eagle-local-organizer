import fs from 'fs';
import path from 'path';
import type { MediaItem } from '../types';
import { isSidecarExtension } from '../types';
import { getPluginPath } from './eagleApiService';
import { getAllMetadata } from './metadataService';
import { logInfo, logError, logWarn } from './logService';

// Re-export for convenience
export { isSidecarExtension };

/**
 * Sidecar name matching patterns:
 * - "photo.xmp" matches "photo.jpg"
 * - "photo.jpg.xmp" matches "photo.jpg"
 */

interface EagleItemLike {
  id: string;
  name: string;
  ext: string;
  filePath: string;
  size: number;
  modifiedAt: number;
  importedAt: number;
}

export interface SidecarCandidate {
  id: string;
  name: string;
  ext: string;
  filePath: string;
  size: number;
  modifiedAt: number;
}

/**
 * Get the temporary directory for plugin-generated sidecars.
 */
export function getSidecarTempDir(): string {
  const pluginPath = getPluginPath();
  const base = pluginPath || path.join(
    (typeof process !== 'undefined' && process.env?.HOME) || '/tmp',
    '.eagle-local-organizer'
  );
  const dir = path.join(base, 'data', 'sidecars');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Find sidecar files in Eagle that match a given media item.
 * Matching rules:
 *   - Same base name with .xmp extension: "photo.xmp" matches "photo.jpg"
 *   - Full name with .xmp appended: "photo.jpg.xmp" matches "photo.jpg"
 *
 * Returns an array of candidates (may have 0, 1, or multiple matches).
 */
export function findSidecarForItem(
  item: MediaItem,
  allEagleItems: EagleItemLike[]
): SidecarCandidate[] {
  const baseName = item.name.toLowerCase();
  const fullName = `${item.name}.${item.ext}`.toLowerCase();
  const candidates: SidecarCandidate[] = [];

  for (const eagleItem of allEagleItems) {
    if (!isSidecarExtension(eagleItem.ext)) continue;

    const candidateName = eagleItem.name.toLowerCase();

    // Pattern 1: same base name (e.g., "photo" matches "photo.xmp")
    if (candidateName === baseName) {
      candidates.push({
        id: eagleItem.id,
        name: eagleItem.name,
        ext: eagleItem.ext,
        filePath: eagleItem.filePath,
        size: eagleItem.size,
        modifiedAt: eagleItem.modifiedAt,
      });
      continue;
    }

    // Pattern 2: full name match (e.g., "photo.jpg" matches "photo.jpg.xmp")
    if (candidateName === fullName) {
      candidates.push({
        id: eagleItem.id,
        name: eagleItem.name,
        ext: eagleItem.ext,
        filePath: eagleItem.filePath,
        size: eagleItem.size,
        modifiedAt: eagleItem.modifiedAt,
      });
    }
  }

  return candidates;
}

/**
 * Generate XMP sidecar content from a media item's metadata.
 * Produces a valid XMP file with Dublin Core and EXIF namespaces.
 */
export function generateXmpContent(item: MediaItem): string {
  const meta = getAllMetadata(item);

  const escapeXml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    '  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    '    <rdf:Description',
    '      xmlns:dc="http://purl.org/dc/elements/1.1/"',
    '      xmlns:xmp="http://ns.adobe.com/xap/1.0/"',
    '      xmlns:exif="http://ns.adobe.com/exif/1.0/"',
    '      xmlns:tiff="http://ns.adobe.com/tiff/1.0/"',
    '      xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">',
  ];

  // Dublin Core: title
  lines.push(`      <dc:title>${escapeXml(item.name)}</dc:title>`);

  // XMP dates
  if (meta.exifDateTimeOriginal) {
    lines.push(`      <xmp:CreateDate>${escapeXml(meta.exifDateTimeOriginal)}</xmp:CreateDate>`);
  } else if (meta.creationDate) {
    lines.push(`      <xmp:CreateDate>${new Date(meta.creationDate).toISOString()}</xmp:CreateDate>`);
  }

  if (meta.exifModifyDate) {
    lines.push(`      <xmp:ModifyDate>${escapeXml(meta.exifModifyDate)}</xmp:ModifyDate>`);
  } else if (meta.modificationDate) {
    lines.push(`      <xmp:ModifyDate>${new Date(meta.modificationDate).toISOString()}</xmp:ModifyDate>`);
  }

  // EXIF data
  if (meta.cameraMake) {
    lines.push(`      <tiff:Make>${escapeXml(meta.cameraMake)}</tiff:Make>`);
  }
  if (meta.cameraModel) {
    lines.push(`      <tiff:Model>${escapeXml(meta.cameraModel)}</tiff:Model>`);
  }
  if (meta.orientation) {
    lines.push(`      <tiff:Orientation>${escapeXml(meta.orientation)}</tiff:Orientation>`);
  }
  if (meta.imageWidth) {
    lines.push(`      <tiff:ImageWidth>${meta.imageWidth}</tiff:ImageWidth>`);
  }
  if (meta.imageHeight) {
    lines.push(`      <tiff:ImageLength>${meta.imageHeight}</tiff:ImageLength>`);
  }
  if (meta.focalLength) {
    lines.push(`      <exif:FocalLength>${escapeXml(meta.focalLength)}</exif:FocalLength>`);
  }
  if (meta.aperture) {
    lines.push(`      <exif:FNumber>${escapeXml(meta.aperture)}</exif:FNumber>`);
  }
  if (meta.shutterSpeed) {
    lines.push(`      <exif:ExposureTime>${escapeXml(meta.shutterSpeed)}</exif:ExposureTime>`);
  }
  if (meta.iso) {
    lines.push(`      <exif:ISOSpeedRatings>${escapeXml(meta.iso)}</exif:ISOSpeedRatings>`);
  }
  if (meta.gpsLatitude) {
    lines.push(`      <exif:GPSLatitude>${escapeXml(meta.gpsLatitude)}</exif:GPSLatitude>`);
  }
  if (meta.gpsLongitude) {
    lines.push(`      <exif:GPSLongitude>${escapeXml(meta.gpsLongitude)}</exif:GPSLongitude>`);
  }
  if (meta.colorSpace) {
    lines.push(`      <exif:ColorSpace>${escapeXml(meta.colorSpace)}</exif:ColorSpace>`);
  }
  if (meta.software) {
    lines.push(`      <xmp:CreatorTool>${escapeXml(meta.software)}</xmp:CreatorTool>`);
  }
  if (meta.lens) {
    lines.push(`      <exif:LensModel>${escapeXml(meta.lens)}</exif:LensModel>`);
  }

  // Tags as subjects
  if (item.tags.length > 0) {
    lines.push('      <dc:subject>');
    lines.push('        <rdf:Bag>');
    for (const tag of item.tags) {
      lines.push(`          <rdf:li>${escapeXml(tag)}</rdf:li>`);
    }
    lines.push('        </rdf:Bag>');
    lines.push('      </dc:subject>');
  }

  lines.push('    </rdf:Description>');
  lines.push('  </rdf:RDF>');
  lines.push('</x:xmpmeta>');

  return lines.join('\n');
}

/**
 * Write an XMP sidecar file for a media item.
 * Returns the file path of the generated sidecar, or undefined on failure.
 */
export function writeSidecarFile(
  item: MediaItem,
  outputDir?: string
): { filePath: string; fileName: string } | undefined {
  const dir = outputDir || getSidecarTempDir();

  try {
    fs.mkdirSync(dir, { recursive: true });

    const fileName = `${item.name}.xmp`;
    const filePath = path.join(dir, fileName);
    const content = generateXmpContent(item);
    fs.writeFileSync(filePath, content, 'utf-8');

    logInfo(`Generated sidecar: ${fileName} for ${item.name}.${item.ext}`);
    return { filePath, fileName };
  } catch (err) {
    logError(`Failed to write sidecar for ${item.name}.${item.ext}`, err);
    return undefined;
  }
}

/**
 * Parse an XMP sidecar file and extract key-value metadata pairs.
 * Returns a flat record of metadata fields found in the XMP.
 */
export function parseSidecarMetadata(
  filePath: string
): Record<string, string> | undefined {
  try {
    if (!fs.existsSync(filePath)) {
      logWarn(`Sidecar file not found: ${filePath}`);
      return undefined;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const result: Record<string, string> = {};

    // Simple XML tag extraction for known XMP fields
    const tagPatterns: Array<{ key: string; regex: RegExp }> = [
      { key: 'title', regex: /<dc:title>([^<]*)<\/dc:title>/i },
      { key: 'createDate', regex: /<xmp:CreateDate>([^<]*)<\/xmp:CreateDate>/i },
      { key: 'modifyDate', regex: /<xmp:ModifyDate>([^<]*)<\/xmp:ModifyDate>/i },
      { key: 'creatorTool', regex: /<xmp:CreatorTool>([^<]*)<\/xmp:CreatorTool>/i },
      { key: 'make', regex: /<tiff:Make>([^<]*)<\/tiff:Make>/i },
      { key: 'model', regex: /<tiff:Model>([^<]*)<\/tiff:Model>/i },
      { key: 'orientation', regex: /<tiff:Orientation>([^<]*)<\/tiff:Orientation>/i },
      { key: 'imageWidth', regex: /<tiff:ImageWidth>([^<]*)<\/tiff:ImageWidth>/i },
      { key: 'imageHeight', regex: /<tiff:ImageLength>([^<]*)<\/tiff:ImageLength>/i },
      { key: 'focalLength', regex: /<exif:FocalLength>([^<]*)<\/exif:FocalLength>/i },
      { key: 'fNumber', regex: /<exif:FNumber>([^<]*)<\/exif:FNumber>/i },
      { key: 'exposureTime', regex: /<exif:ExposureTime>([^<]*)<\/exif:ExposureTime>/i },
      { key: 'iso', regex: /<exif:ISOSpeedRatings>([^<]*)<\/exif:ISOSpeedRatings>/i },
      { key: 'gpsLatitude', regex: /<exif:GPSLatitude>([^<]*)<\/exif:GPSLatitude>/i },
      { key: 'gpsLongitude', regex: /<exif:GPSLongitude>([^<]*)<\/exif:GPSLongitude>/i },
      { key: 'colorSpace', regex: /<exif:ColorSpace>([^<]*)<\/exif:ColorSpace>/i },
      { key: 'lensModel', regex: /<exif:LensModel>([^<]*)<\/exif:LensModel>/i },
    ];

    for (const { key, regex } of tagPatterns) {
      const match = content.match(regex);
      if (match && match[1]) {
        result[key] = match[1].trim();
      }
    }

    // Extract subjects (tags) from rdf:Bag
    const subjectsMatch = content.match(/<dc:subject>[\s\S]*?<rdf:Bag>([\s\S]*?)<\/rdf:Bag>/i);
    if (subjectsMatch) {
      const items: string[] = [];
      const liRegex = /<rdf:li>([^<]*)<\/rdf:li>/gi;
      let m;
      while ((m = liRegex.exec(subjectsMatch[1])) !== null) {
        items.push(m[1].trim());
      }
      if (items.length > 0) {
        result['subjects'] = items.join(', ');
      }
    }

    logInfo(`Parsed sidecar metadata: ${filePath} (${Object.keys(result).length} fields)`);
    return result;
  } catch (err) {
    logError(`Failed to parse sidecar: ${filePath}`, err);
    return undefined;
  }
}

/**
 * Remove generated sidecar files from the plugin temp directory.
 */
export function clearGeneratedSidecars(): void {
  try {
    const dir = getSidecarTempDir();
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      logInfo('Cleared generated sidecars directory');
    }
  } catch (err) {
    logError('Failed to clear generated sidecars', err);
  }
}
