import { create } from 'zustand';
import type { OperationType } from '../types';

interface OperationState {
  type: OperationType;
  isRunning: boolean;
  progress: number;
  currentFileName: string;
  message: string;
  completionMessage: string;

  startOperation: (type: OperationType, message: string) => void;
  updateProgress: (progress: number, fileName: string) => void;
  completeOperation: (completionMessage: string) => void;
  reset: () => void;
}

export const useOperationStore = create<OperationState>((set) => ({
  type: 'idle',
  isRunning: false,
  progress: 0,
  currentFileName: '',
  message: '',
  completionMessage: '',

  startOperation: (type, message) => {
    set({
      type,
      isRunning: true,
      progress: 0,
      currentFileName: '',
      message,
      completionMessage: '',
    });
  },

  updateProgress: (progress, fileName) => {
    set({ progress, currentFileName: fileName });
  },

  completeOperation: (completionMessage) => {
    set({
      isRunning: false,
      progress: 100,
      currentFileName: '',
      completionMessage,
    });
    // Clear completion message after 4 seconds
    setTimeout(() => {
      set((state) => {
        if (!state.isRunning) {
          return { type: 'idle', completionMessage: '', message: '' };
        }
        return state;
      });
    }, 4000);
  },

  reset: () => {
    set({
      type: 'idle',
      isRunning: false,
      progress: 0,
      currentFileName: '',
      message: '',
      completionMessage: '',
    });
  },
}));
