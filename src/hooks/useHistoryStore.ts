import { create } from 'zustand';
import type { ExportSession } from '../types';
import {
  loadExportHistory,
  addExportSession,
  saveExportHistory,
} from '../services/storageService';

interface HistoryState {
  sessions: ExportSession[];
  loadHistory: () => void;
  addSession: (session: ExportSession) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  sessions: [],

  loadHistory: () => {
    set({ sessions: loadExportHistory() });
  },

  addSession: (session) => {
    addExportSession(session);
    set((state) => ({
      sessions: [session, ...state.sessions],
    }));
  },

  clearHistory: () => {
    saveExportHistory([]);
    set({ sessions: [] });
  },
}));
