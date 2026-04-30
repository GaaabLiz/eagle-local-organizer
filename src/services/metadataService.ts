import fs from 'fs';
import ExifReader from 'exifreader';
import type { MediaItem } from '../types';

export interface FullMetadata {
  creationDate?: number;
  modificationDate?: number;
  eagleImportedAt: number;
  eagleModifiedAt: number;
  exifDateTimeOriginal?: string;
  exifDateTimeDigitized?: string;
  exifModifyDate?: string;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
  imageWidth?: number;
  imageHeight?: number;
  orientation?: string;
  colorSpace?: string;
  software?: string;
  [key: string]: unknown;
}

/**
 * Read EXIF data from a file. Returns null if EXIF is not available.
 */
export function readExifData(
  filePath: string
): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    const tags = ExifReader.load(arrayBuffer, { expanded: true });
    return tags as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Parse an EXIF date string like "2024:06:15 14:30:00" into a timestamp.
 */
export function parseExifDate(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  // EXIF date format: "YYYY:MM:DD HH:MM:SS"
  const cleaned = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  const ts = new Date(cleaned).getTime();
  return isNaN(ts) ? undefined : ts;
}

/**
 * Get the best creation date for a media item.
 * Priority: EXIF DateTimeOriginal → Eagle importedAt → file stat birthtime
 */
export function getCreationDate(item: MediaItem): number {
  if (item.exifDate && item.exifDate > 0) return item.exifDate;
  if (item.importedAt && item.importedAt > 0) return item.importedAt;
  try {
    const stat = fs.statSync(item.filePath);
    return stat.birthtime.getTime();
  } catch {
    return Date.now();
  }
}

/**
 * Extract EXIF creation date from a file.
 */
export function extractExifCreationDate(filePath: string): number | undefined {
  const exif = readExifData(filePath);
  if (!exif) return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exifData = exif as any;

  const dateOriginal =
    exifData?.exif?.DateTimeOriginal?.description ??
    exifData?.exif?.DateTimeOriginal?.value;
  if (dateOriginal) return parseExifDate(String(dateOriginal));

  const dateDigitized =
    exifData?.exif?.DateTimeDigitized?.description ??
    exifData?.exif?.DateTimeDigitized?.value;
  if (dateDigitized) return parseExifDate(String(dateDigitized));

  const dateTime =
    exifData?.exif?.DateTime?.description ??
    exifData?.exif?.DateTime?.value;
  if (dateTime) return parseExifDate(String(dateTime));

  return undefined;
}

/**
 * Extract EXIF modification date from a file.
 */
export function extractExifModificationDate(
  filePath: string
): number | undefined {
  const exif = readExifData(filePath);
  if (!exif) return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exifData = exif as any;
  const dateTime =
    exifData?.exif?.DateTime?.description ??
    exifData?.exif?.DateTime?.value;
  return dateTime ? parseExifDate(String(dateTime)) : undefined;
}

/**
 * Read Eagle's metadata.json for an item.
 */
export function readEagleMetadata(
  metadataFilePath: string
): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(metadataFilePath)) return null;
    const raw = fs.readFileSync(metadataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Gather all metadata for a media item (EXIF + Eagle + filesystem).
 */
export function getAllMetadata(item: MediaItem): FullMetadata {
  const meta: FullMetadata = {
    eagleImportedAt: item.importedAt,
    eagleModifiedAt: item.modifiedAt,
    imageWidth: item.width,
    imageHeight: item.height,
  };

  try {
    const stat = fs.statSync(item.filePath);
    meta.creationDate = stat.birthtime.getTime();
    meta.modificationDate = stat.mtime.getTime();
  } catch {
    // File may not be accessible
  }

  const exif = readExifData(item.filePath);
  if (exif) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = exif as any;
    const exifBlock = e?.exif || {};
    const imageBlock = e?.image || {};
    const gpsBlock = e?.gps || {};

    meta.exifDateTimeOriginal =
      exifBlock?.DateTimeOriginal?.description ?? undefined;
    meta.exifDateTimeDigitized =
      exifBlock?.DateTimeDigitized?.description ?? undefined;
    meta.exifModifyDate = exifBlock?.DateTime?.description ?? undefined;
    meta.cameraMake = imageBlock?.Make?.description ?? undefined;
    meta.cameraModel = imageBlock?.Model?.description ?? undefined;
    meta.lens =
      exifBlock?.LensModel?.description ??
      exifBlock?.LensMake?.description ??
      undefined;
    meta.focalLength = exifBlock?.FocalLength?.description ?? undefined;
    meta.aperture = exifBlock?.FNumber?.description ?? undefined;
    meta.shutterSpeed = exifBlock?.ExposureTime?.description ?? undefined;
    meta.iso = exifBlock?.ISOSpeedRatings?.description ?? undefined;
    meta.gpsLatitude = gpsBlock?.Latitude?.description ?? undefined;
    meta.gpsLongitude = gpsBlock?.Longitude?.description ?? undefined;
    meta.orientation = imageBlock?.Orientation?.description ?? undefined;
    meta.colorSpace = exifBlock?.ColorSpace?.description ?? undefined;
    meta.software = imageBlock?.Software?.description ?? undefined;
  }

  return meta;
}
