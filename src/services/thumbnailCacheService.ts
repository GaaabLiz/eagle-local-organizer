import fs from 'fs';
import path from 'path';
import { getPluginPath } from './eagleApiService';
import type { MediaItem } from '../types';

const PREVIEW_MAX_SIZE = 800; // max dimension for preview images
const CACHE_DIR_NAME = 'preview-cache';

function getCacheDir(): string {
  const pluginPath = getPluginPath();
  const base = pluginPath || path.join(
    (typeof process !== 'undefined' && process.env?.HOME) || '/tmp',
    '.eagle-local-organizer'
  );
  return path.join(base, 'data', CACHE_DIR_NAME);
}

function ensureCacheDir(): string {
  const dir = getCacheDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getCacheFilePath(itemId: string): string {
  return path.join(getCacheDir(), `${itemId}.jpg`);
}

/**
 * Check if a cached preview already exists for an item.
 */
export function getCachedPreview(itemId: string): string | undefined {
  const cachePath = getCacheFilePath(itemId);
  try {
    if (fs.existsSync(cachePath)) {
      return cachePath;
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Generate a low-res preview for a photo item using an off-screen canvas.
 * Returns the cache file path, or undefined if generation fails.
 * This is async and non-blocking.
 */
export function generatePreview(item: MediaItem): Promise<string | undefined> {
  return new Promise((resolve) => {
    // Only generate for photo types
    if (item.type !== 'photo') {
      resolve(undefined);
      return;
    }

    // Check if already cached
    const existing = getCachedPreview(item.id);
    if (existing) {
      resolve(existing);
      return;
    }

    // Use Eagle's thumbnail if available (much faster than loading full image)
    const sourcePath = item.thumbnailPath || item.filePath;

    try {
      // Use HTML Image + Canvas for resizing (works in Eagle's Chromium env)
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate scaled dimensions
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (w > PREVIEW_MAX_SIZE || h > PREVIEW_MAX_SIZE) {
            const ratio = Math.min(PREVIEW_MAX_SIZE / w, PREVIEW_MAX_SIZE / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(undefined);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);

          // Export as JPEG blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(undefined);
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const dir = ensureCacheDir();
                  const cachePath = path.join(dir, `${item.id}.jpg`);
                  const buffer = Buffer.from(reader.result as ArrayBuffer);
                  fs.writeFileSync(cachePath, buffer);
                  resolve(cachePath);
                } catch {
                  resolve(undefined);
                }
              };
              reader.onerror = () => resolve(undefined);
              reader.readAsArrayBuffer(blob);
            },
            'image/jpeg',
            0.75
          );
        } catch {
          resolve(undefined);
        }
      };

      img.onerror = () => resolve(undefined);

      // Set a timeout so we don't hang on broken images
      const timeout = setTimeout(() => {
        img.src = '';
        resolve(undefined);
      }, 5000);

      const originalOnload = img.onload;
      img.onload = function (ev: Event) {
        clearTimeout(timeout);
        if (originalOnload) {
          originalOnload.call(this, ev);
        }
      };

      img.src = `file://${sourcePath}`;
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * Clear the preview cache directory.
 */
export function clearPreviewCache(): void {
  try {
    const dir = getCacheDir();
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    // silent
  }
}
