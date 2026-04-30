import type { EagleItem, EagleFolder, EagleTag, EagleAPI } from '../types/eagle.d';
import { getMediaType } from '../types';
import type { MediaItem } from '../types';

/**
 * Wrapper around the Eagle plugin API for typed access.
 */

function getEagle(): EagleAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).eagle as EagleAPI;
}

export async function getSelectedItems(): Promise<EagleItem[]> {
  return getEagle().item.getSelected();
}

export async function getItemsByFolder(folderId: string): Promise<EagleItem[]> {
  return getEagle().item.get({ folders: [folderId] });
}

export async function getItemsByTag(tagName: string): Promise<EagleItem[]> {
  return getEagle().item.get({ tags: [tagName] });
}

export async function getAllFolders(): Promise<EagleFolder[]> {
  return getEagle().folder.getAll();
}

export async function getAllTags(): Promise<EagleTag[]> {
  return getEagle().tag.get();
}

export async function getItemById(id: string): Promise<EagleItem | null> {
  return getEagle().item.getById(id);
}

/**
 * Flatten nested Eagle folders into a flat list with full path names.
 */
export function flattenFolders(
  folders: EagleFolder[],
  parentPath = ''
): Array<{ id: string; name: string; fullPath: string }> {
  const result: Array<{ id: string; name: string; fullPath: string }> = [];
  for (const folder of folders) {
    const fullPath = parentPath ? `${parentPath} / ${folder.name}` : folder.name;
    result.push({ id: folder.id, name: folder.name, fullPath });
    if (folder.children && folder.children.length > 0) {
      result.push(...flattenFolders(folder.children, fullPath));
    }
  }
  return result;
}

/**
 * Convert an Eagle API item to our internal MediaItem type.
 */
export function eagleItemToMediaItem(item: EagleItem): MediaItem {
  return {
    id: item.id,
    name: item.name,
    ext: item.ext,
    filePath: item.filePath,
    thumbnailPath: item.thumbnailPath,
    tags: item.tags || [],
    folders: item.folders || [],
    width: item.width,
    height: item.height,
    size: item.size,
    importedAt: item.importedAt,
    modifiedAt: item.modifiedAt,
    type: getMediaType(item.ext),
    hasExif: false,
    destinationPath: undefined,
  };
}

/**
 * Show a folder picker dialog via Eagle API.
 */
export async function showFolderPicker(
  defaultPath?: string
): Promise<string | null> {
  const result = await getEagle().dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    defaultPath,
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
}

/**
 * Show a confirmation message box via Eagle API.
 */
export async function showConfirmDialog(
  message: string,
  detail?: string
): Promise<boolean> {
  const result = await getEagle().dialog.showMessageBox({
    type: 'question',
    message,
    detail,
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1,
  });
  return result.response === 0;
}

/**
 * Get the current Eagle theme.
 */
export function getTheme(): string {
  try {
    return getEagle().app.theme || 'LIGHT';
  } catch {
    return 'LIGHT';
  }
}

/**
 * Open a file in Eagle.
 */
export function openInEagle(itemId: string): void {
  try {
    // Eagle protocol to reveal/focus an item
    getEagle().shell.openExternal(`eagle://item/${itemId}`);
  } catch {
    // Fallback: no-op if not supported
  }
}

/**
 * Get the plugin's path on disk.
 */
let _pluginPath = '';
export function setPluginPath(p: string): void {
  _pluginPath = p;
}
export function getPluginPath(): string {
  return _pluginPath;
}
