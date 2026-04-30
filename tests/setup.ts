import '@testing-library/jest-dom';

// Mock Eagle API globally
const mockEagleApi = {
  item: {
    get: jest.fn().mockResolvedValue([]),
    getAll: jest.fn().mockResolvedValue([]),
    getSelected: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
  },
  folder: {
    getAll: jest.fn().mockResolvedValue([]),
    getSelected: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
  },
  tag: {
    get: jest.fn().mockResolvedValue([]),
  },
  dialog: {
    showOpenDialog: jest.fn().mockResolvedValue({ canceled: true, filePaths: [] }),
    showSaveDialog: jest.fn().mockResolvedValue({ canceled: true }),
    showMessageBox: jest.fn().mockResolvedValue({ response: 0 }),
  },
  app: {
    theme: 'LIGHT',
    isDarkColors: jest.fn().mockReturnValue(false),
    version: '4.0.0',
    locale: 'en',
    arch: 'x64',
  },
  shell: {
    openExternal: jest.fn(),
    openPath: jest.fn(),
    beep: jest.fn(),
  },
  onPluginCreate: jest.fn(),
  onPluginRun: jest.fn(),
  onPluginShow: jest.fn(),
  onPluginHide: jest.fn(),
  onPluginBeforeExit: jest.fn(),
  onThemeChanged: jest.fn(),
};

(global as Record<string, unknown>).eagle = mockEagleApi;
Object.defineProperty(window, 'eagle', { value: mockEagleApi, writable: true });

// Mock window.close
window.close = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

export { mockEagleApi };
