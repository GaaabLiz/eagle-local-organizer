import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setPluginPath, getTheme } from './services/eagleApiService';
import { useSettingsStore } from './hooks/useSettingsStore';
import { useHistoryStore } from './hooks/useHistoryStore';

import './styles/globals.css';
import './styles/titlebar.css';
import './styles/table.css';
import './styles/dialogs.css';
import './styles/statusbar.css';

function applyTheme(theme: string) {
  document.documentElement.setAttribute('theme', theme.toLowerCase());
}

function initializePlugin() {
  // Apply initial theme
  applyTheme(getTheme());

  // Load persisted data
  useSettingsStore.getState().loadSettings();
  useHistoryStore.getState().loadHistory();

  // Mount React
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

// Eagle lifecycle hooks
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eagleApi = (window as any).eagle;

  if (eagleApi && typeof eagleApi.onPluginCreate === 'function') {
    eagleApi.onPluginCreate((plugin: { path: string }) => {
      setPluginPath(plugin.path);
      initializePlugin();
    });

    eagleApi.onThemeChanged((theme: string) => {
      applyTheme(theme);
    });

    eagleApi.onPluginShow(() => {
      // Reload settings in case they were modified externally
      useSettingsStore.getState().loadSettings();
    });
  } else {
    // Not running inside Eagle — initialize immediately (dev mode)
    initializePlugin();
  }
} catch {
  // Fallback: initialize immediately
  initializePlugin();
}
