import path from 'path';

/**
 * Format file size in bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Sanitize a filename by removing or replacing invalid characters.
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
}

/**
 * Build a unique filename to avoid collisions.
 * If file.jpg already exists, returns file (1).jpg, file (2).jpg, etc.
 */
export function buildUniqueFilename(
  destDir: string,
  baseName: string,
  ext: string,
  existingCheck: (fullPath: string) => boolean
): string {
  const safeName = sanitizeFilename(baseName);
  let candidate = path.join(destDir, `${safeName}.${ext}`);
  if (!existingCheck(candidate)) return candidate;

  let counter = 1;
  while (counter < 10000) {
    candidate = path.join(destDir, `${safeName} (${counter}).${ext}`);
    if (!existingCheck(candidate)) return candidate;
    counter++;
  }
  return candidate;
}

/**
 * Generate a simple unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
