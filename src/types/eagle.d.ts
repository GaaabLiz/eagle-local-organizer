/* eslint-disable @typescript-eslint/no-explicit-any */

/** Eagle Plugin API type declarations */

interface EagleItem {
  id: string;
  name: string;
  ext: string;
  filePath: string;
  fileURL: string;
  thumbnailPath?: string;
  width: number;
  height: number;
  size: number;
  tags: string[];
  folders: string[];
  importedAt: number;
  modifiedAt: number;
  star: number;
  annotation: string;
  metadataFilePath: string;
  palettes?: Array<{ color: number[]; ratio: number }>;
  isDeleted?: boolean;
  url?: string;
  noThumbnail?: boolean;
}

interface EagleFolder {
  id: string;
  name: string;
  description?: string;
  parent?: string;
  children: EagleFolder[];
  iconColor?: string;
}

interface EagleTag {
  name: string;
  count: number;
  groups?: string[];
}

interface EagleItemGetOptions {
  id?: string;
  ids?: string[];
  isSelected?: boolean;
  ext?: string;
  tags?: string[];
  folders?: string[];
  fields?: string[];
}

interface EagleDialogOpenResult {
  canceled: boolean;
  filePaths: string[];
}

interface EagleDialogSaveResult {
  canceled: boolean;
  filePath?: string;
}

interface EagleDialogMessageBoxResult {
  response: number;
  checkboxChecked?: boolean;
}

interface EagleDialogOpenOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
  >;
}

interface EagleDialogMessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
}

interface EagleItemAPI {
  get(options?: EagleItemGetOptions): Promise<EagleItem[]>;
  getAll(): Promise<EagleItem[]>;
  getSelected(): Promise<EagleItem[]>;
  getById(id: string): Promise<EagleItem | null>;
}

interface EagleFolderAPI {
  getAll(): Promise<EagleFolder[]>;
  getSelected(): Promise<EagleFolder[]>;
  getById(id: string): Promise<EagleFolder | null>;
}

interface EagleTagAPI {
  get(): Promise<EagleTag[]>;
}

interface EagleDialogAPI {
  showOpenDialog(options: EagleDialogOpenOptions): Promise<EagleDialogOpenResult>;
  showSaveDialog(options: any): Promise<EagleDialogSaveResult>;
  showMessageBox(
    options: EagleDialogMessageBoxOptions
  ): Promise<EagleDialogMessageBoxResult>;
}

interface EagleAppAPI {
  theme: string;
  isDarkColors(): boolean;
  version: string;
  locale: string;
  arch: string;
}

interface EagleShellAPI {
  openExternal(url: string): void;
  openPath(path: string): void;
  beep(): void;
}

interface EaglePluginInfo {
  path: string;
  manifest: {
    id: string;
    version: string;
    name: string;
    logo?: string;
    [key: string]: any;
  };
}

interface EagleAPI {
  item: EagleItemAPI;
  folder: EagleFolderAPI;
  tag: EagleTagAPI;
  dialog: EagleDialogAPI;
  app: EagleAppAPI;
  shell: EagleShellAPI;

  onPluginCreate(callback: (plugin: EaglePluginInfo) => void): void;
  onPluginRun(callback: () => void): void;
  onPluginShow(callback: () => void): void;
  onPluginHide(callback: () => void): void;
  onPluginBeforeExit(callback: (event?: any) => void): void;
  onThemeChanged(callback: (theme: string) => void): void;
}

declare const eagle: EagleAPI;

declare global {
  interface Window {
    eagle: EagleAPI;
  }
}

export type {
  EagleItem,
  EagleFolder,
  EagleTag,
  EagleItemGetOptions,
  EagleDialogOpenResult,
  EagleDialogMessageBoxResult,
  EagleDialogOpenOptions,
  EagleDialogMessageBoxOptions,
  EagleItemAPI,
  EagleFolderAPI,
  EagleTagAPI,
  EagleDialogAPI,
  EagleAppAPI,
  EagleShellAPI,
  EaglePluginInfo,
  EagleAPI,
};
