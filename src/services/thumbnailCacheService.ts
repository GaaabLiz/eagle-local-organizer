import fs from 'fs';
import path from 'path';
import { getPluginPath } from './eagleApiService';
import type { MediaItem } from '../types';

const PREVIEW_MAX_SIZE = 800; // max dimension for preview images
const CACHE_DIR_NAME = 'preview-cache';

// In-memory set of cached item IDs (avoids repeated fs.existsSync calls)
let cachedItemIds: Set<string> | null = null;

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
 * Load all cached file names into memory for fast lookup.
 */
function loadCacheIndex(): Set<string> {
  if (cachedItemIds) return cachedItemIds;
  cachedItemIds = new Set();
  try {
    const dir = getCacheDir();
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.endsWith('.jpg')) {
          cachedItemIds.add(f.slice(0, -4)); // remove .jpg
        }
      }
    }
  } catch {
    // ignore — will be empty set
  }
  return cachedItemIds;
}

/**
 * Check if a cached preview already exists for an item.
 * Uses in-memory index for O(1) lookup — no filesystem calls per item.
 */
export function getCachedPreview(itemId: string): string | undefined {
  const index = loadCacheIndex();
  if (index.has(itemId)) {
    return getCacheFilePath(itemId);
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
                  // Update in-memory index
                  loadCacheIndex().add(item.id);
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
    cachedItemIds = null; // reset index
  } catch {
    // silent
  }
}
