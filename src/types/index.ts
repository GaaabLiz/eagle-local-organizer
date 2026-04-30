export type AddMode = 'selected' | 'folder' | 'tag';

export type FolderStructure = 'year-month' | 'year-month-day' | 'tag' | 'none';

export type MediaType = 'photo' | 'video' | 'other';

export type ExportFileStatus = 'success' | 'error' | 'duplicate' | 'skipped';

export type OperationType = 'export' | 'sidecar' | 'update' | 'loading' | 'idle';

export interface MediaItem {
  id: string;
  name: string;
  ext: string;
  filePath: string;
  thumbnailPath?: string;
  cachedPreviewPath?: string;
  tags: string[];
  folders: string[];
  width: number;
  height: number;
  size: number;
  importedAt: number;
  modifiedAt: number;
  type: MediaType;
  exifDate?: number;
  exifModifiedDate?: number;
  destinationPath?: string;
  hasExif: boolean;
  /** If this item is a sidecar file */
  isSidecar?: boolean;
  /** ID of the linked sidecar (on media) or linked media (on sidecar) */
  sidecarId?: string;
  /** Whether this media item has a linked sidecar in the plugin */
  hasSidecar?: boolean;
}

export interface ExportedFile {
  id: string;
  name: string;
  ext: string;
  sourcePath: string;
  destinationPath: string;
  status: ExportFileStatus;
  errorMessage?: string;
  exportedAt: number;
}

export interface ExportSession {
  id: string;
  date: number;
  itemCount: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  destinationFolder: string;
  folderStructure: FolderStructure;
  dryRun: boolean;
  items: ExportedFile[];
}

export interface PluginSettings {
  exportDestination: string;
  folderStructure: FolderStructure;
  dryRun: boolean;
  importSidecars: boolean;
}

export interface OperationState {
  type: OperationType;
  isRunning: boolean;
  progress: number;
  currentFileName: string;
  message: string;
}

export interface AddSource {
  mode: AddMode;
  folderId?: string;
  folderName?: string;
  tagName?: string;
}

export const SIDECAR_EXTENSIONS = new Set(['xmp']);

export const PHOTO_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'svg',
  'ico', 'heic', 'heif', 'avif', 'raw', 'cr2', 'nef', 'arw', 'dng',
  'orf', 'rw2', 'pef', 'srw',
]);

export const VIDEO_EXTENSIONS = new Set([
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpg',
  'mpeg', '3gp', 'ogv', 'ts', 'mts',
]);

export function getMediaType(ext: string): MediaType {
  const lower = ext.toLowerCase();
  if (PHOTO_EXTENSIONS.has(lower)) return 'photo';
  if (VIDEO_EXTENSIONS.has(lower)) return 'video';
  return 'other';
}

export function isSidecarExtension(ext: string): boolean {
  return SIDECAR_EXTENSIONS.has(ext.toLowerCase());
}
