import { create } from 'zustand';
import type { PluginSettings } from '../types';
import {
  loadSettings as loadFromStorage,
  saveSettings as saveToStorage,
} from '../services/storageService';

interface SettingsState {
  settings: PluginSettings;
  loadSettings: () => void;
  saveSettings: (settings: PluginSettings) => void;
  updateSetting: <K extends keyof PluginSettings>(
    key: K,
    value: PluginSettings[K]
  ) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: loadFromStorage(),

  loadSettings: () => {
    set({ settings: loadFromStorage() });
  },

  saveSettings: (settings) => {
    saveToStorage(settings);
    set({ settings });
  },

  updateSetting: (key, value) => {
    set((state) => {
      const newSettings = { ...state.settings, [key]: value };
      saveToStorage(newSettings);
      return { settings: newSettings };
    });
  },

  resetSettings: () => {
    const defaults = loadFromStorage();
    saveToStorage(defaults);
    set({ settings: defaults });
  },
}));
