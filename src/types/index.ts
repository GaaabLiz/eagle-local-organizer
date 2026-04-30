export type AddMode = 'selected' | 'folder' | 'tag';

export type FolderStructure = 'year-month' | 'year-month-day' | 'tag' | 'none';

export type MediaType = 'photo' | 'video' | 'other';

export type ExportFileStatus = 'success' | 'error' | 'duplicate' | 'skipped';

export type OperationType = 'export' | 'sidecar' | 'update' | 'idle';

export interface MediaItem {
  id: string;
  name: string;
  ext: string;
  filePath: string;
  thumbnailPath?: string;
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
