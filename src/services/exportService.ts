import fs from 'fs';
import path from 'path';
import type {
  MediaItem,
  PluginSettings,
  ExportedFile,
  ExportSession,
  FolderStructure,
  ExportFileStatus,
} from '../types';
import { getCreationDate } from './metadataService';
import { getYear, getMonth, getDay, now } from '../utils/dateUtils';
import { sanitizeFilename, generateId } from '../utils/fileUtils';

export type ProgressCallback = (
  current: number,
  total: number,
  fileName: string
) => void;

/**
 * Compute the destination subdirectory for an item based on folder structure.
 * For 'tag' structure, returns one path per tag (duplicating the file).
 */
export function computeDestinationPaths(
  item: MediaItem,
  settings: PluginSettings
): string[] {
  const base = settings.exportDestination;
  const creationDate = getCreationDate(item);

  switch (settings.folderStructure) {
    case 'year-month': {
      const sub = path.join(getYear(creationDate), getMonth(creationDate));
      return [path.join(base, sub)];
    }
    case 'year-month-day': {
      const sub = path.join(
        getYear(creationDate),
        getMonth(creationDate),
        getDay(creationDate)
      );
      return [path.join(base, sub)];
    }
    case 'tag': {
      if (item.tags.length === 0) {
        return [path.join(base, 'Untagged')];
      }
      return item.tags.map((tag) =>
        path.join(base, sanitizeFilename(tag))
      );
    }
    case 'none':
      return [base];
    default:
      return [base];
  }
}

/**
 * Check if a file already exists at the destination with the same name and size.
 */
function isDuplicate(destPath: string, sourceSize: number): boolean {
  try {
    if (!fs.existsSync(destPath)) return false;
    const stat = fs.statSync(destPath);
    return stat.size === sourceSize;
  } catch {
    return false;
  }
}

/**
 * Export a single file to the destination.
 */
function exportSingleFile(
  item: MediaItem,
  destDir: string,
  dryRun: boolean
): ExportedFile {
  const fileName = `${sanitizeFilename(item.name)}.${item.ext}`;
  const destPath = path.join(destDir, fileName);

  if (isDuplicate(destPath, item.size)) {
    return {
      id: item.id,
      name: item.name,
      ext: item.ext,
      sourcePath: item.filePath,
      destinationPath: destPath,
      status: 'duplicate' as ExportFileStatus,
      exportedAt: now(),
    };
  }

  if (dryRun) {
    return {
      id: item.id,
      name: item.name,
      ext: item.ext,
      sourcePath: item.filePath,
      destinationPath: destPath,
      status: 'skipped' as ExportFileStatus,
      exportedAt: now(),
    };
  }

  try {
    fs.mkdirSync(destDir, { recursive: true });

    // Use streams for large files (>50MB), copyFileSync for smaller ones
    if (item.size > 50 * 1024 * 1024) {
      const readStream = fs.createReadStream(item.filePath);
      const writeStream = fs.createWriteStream(destPath);
      return new Promise<ExportedFile>((resolve) => {
        readStream.pipe(writeStream);
        writeStream.on('finish', () => {
          resolve({
            id: item.id,
            name: item.name,
            ext: item.ext,
            sourcePath: item.filePath,
            destinationPath: destPath,
            status: 'success' as ExportFileStatus,
            exportedAt: now(),
          });
        });
        writeStream.on('error', (err) => {
          resolve({
            id: item.id,
            name: item.name,
            ext: item.ext,
            sourcePath: item.filePath,
            destinationPath: destPath,
            status: 'error' as ExportFileStatus,
            errorMessage: `Export failed: ${err.message}`,
            exportedAt: now(),
          });
        });
      }) as unknown as ExportedFile;
    }

    fs.copyFileSync(item.filePath, destPath);
    return {
      id: item.id,
      name: item.name,
      ext: item.ext,
      sourcePath: item.filePath,
      destinationPath: destPath,
      status: 'success' as ExportFileStatus,
      exportedAt: now(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error';
    return {
      id: item.id,
      name: item.name,
      ext: item.ext,
      sourcePath: item.filePath,
      destinationPath: destPath,
      status: 'error' as ExportFileStatus,
      errorMessage: `Export failed: ${message}`,
      exportedAt: now(),
    };
  }
}

/**
 * Export all items according to settings. Calls onProgress after each item.
 * Returns an ExportSession with full results.
 */
export async function exportItems(
  items: MediaItem[],
  settings: PluginSettings,
  onProgress: ProgressCallback
): Promise<ExportSession> {
  const exportedFiles: ExportedFile[] = [];
  const total = items.length;
  let successCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress(i, total, item.name);

    const destPaths = computeDestinationPaths(item, settings);

    for (const destDir of destPaths) {
      const result = exportSingleFile(item, destDir, settings.dryRun);

      // Handle promise results from large file streaming
      const resolved =
        result instanceof Promise ? await result : result;

      exportedFiles.push(resolved);

      switch (resolved.status) {
        case 'success':
          successCount++;
          break;
        case 'error':
          errorCount++;
          break;
        case 'duplicate':
          duplicateCount++;
          break;
      }
    }

    // Small yield to keep UI responsive
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  onProgress(total, total, '');

  const session: ExportSession = {
    id: generateId(),
    date: now(),
    itemCount: total,
    successCount,
    errorCount,
    duplicateCount,
    destinationFolder: settings.exportDestination,
    folderStructure: settings.folderStructure,
    dryRun: settings.dryRun,
    items: exportedFiles,
  };

  return session;
}

/**
 * Pre-compute destination paths for all items (for table display).
 */
export function computeAllDestinations(
  items: MediaItem[],
  settings: PluginSettings
): MediaItem[] {
  return items.map((item) => {
    const paths = computeDestinationPaths(item, settings);
    return {
      ...item,
      destinationPath: paths[0],
    };
  });
}

/**
 * Get the primary destination path string for an item.
 */
export function getPrimaryDestination(
  item: MediaItem,
  folderStructure: FolderStructure,
  exportDestination: string
): string {
  const paths = computeDestinationPaths(item, {
    exportDestination,
    folderStructure,
    dryRun: false,
    importSidecars: false,
  });
  return paths[0] || exportDestination;
}
