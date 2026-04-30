import type { PluginSettings, ExportSession } from '../types';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { getPluginPath } from './eagleApiService';

const SETTINGS_KEY = 'localOrganizer_settings';
const HISTORY_KEY = 'localOrganizer_history';

function getDefaultSettings(): PluginSettings {
  return {
    exportDestination: path.join(os.homedir(), 'Documents'),
    folderStructure: 'year-month',
    dryRun: false,
    importSidecars: false,
  };
}

/**
 * Save settings to localStorage and as a JSON backup file.
 */
export function saveSettings(settings: PluginSettings): void {
  try {
    const json = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, json);

    // Backup to plugin directory
    const pluginPath = getPluginPath();
    if (pluginPath) {
      const dataDir = path.join(pluginPath, 'data');
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(
        path.join(dataDir, 'settings.json'),
        json,
        'utf-8'
      );
    }
  } catch {
    // Silent fail — localStorage should always work in Eagle
  }
}

/**
 * Load settings from localStorage, falling back to file backup, then defaults.
 */
export function loadSettings(): PluginSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...getDefaultSettings(), ...JSON.parse(stored) };
    }
  } catch {
    // Try file backup
  }

  try {
    const pluginPath = getPluginPath();
    if (pluginPath) {
      const filePath = path.join(pluginPath, 'data', 'settings.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Restore to localStorage
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
        return { ...getDefaultSettings(), ...parsed };
      }
    }
  } catch {
    // Use defaults
  }

  return getDefaultSettings();
}

/**
 * Save export history to localStorage and file backup.
 */
export function saveExportHistory(sessions: ExportSession[]): void {
  try {
    const json = JSON.stringify(sessions);
    localStorage.setItem(HISTORY_KEY, json);

    const pluginPath = getPluginPath();
    if (pluginPath) {
      const dataDir = path.join(pluginPath, 'data');
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(
        path.join(dataDir, 'history.json'),
        json,
        'utf-8'
      );
    }
  } catch {
    // Silent fail
  }
}

/**
 * Add a single export session to history.
 */
export function addExportSession(session: ExportSession): void {
  const sessions = loadExportHistory();
  sessions.unshift(session);
  // Keep max 50 sessions
  if (sessions.length > 50) {
    sessions.length = 50;
  }
  saveExportHistory(sessions);
}

/**
 * Load export history from localStorage, falling back to file backup.
 */
export function loadExportHistory(): ExportSession[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Try file backup
  }

  try {
    const pluginPath = getPluginPath();
    if (pluginPath) {
      const filePath = path.join(pluginPath, 'data', 'history.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    }
  } catch {
    // Return empty
  }

  return [];
}

/**
 * Clear the plugin's cache (localStorage + temporary data).
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Silent fail
  }
}

/**
 * Reset the plugin to its initial state: clear all persisted data.
 */
export function resetPlugin(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(HISTORY_KEY);

    const pluginPath = getPluginPath();
    if (pluginPath) {
      const dataDir = path.join(pluginPath, 'data');
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }
    }
  } catch {
    // Silent fail
  }
}
