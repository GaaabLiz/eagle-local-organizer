import { useOperationStore } from '../../src/hooks/useOperationStore';

describe('useOperationStore', () => {
  beforeEach(() => {
    useOperationStore.getState().reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in idle state', () => {
    const state = useOperationStore.getState();
    expect(state.type).toBe('idle');
    expect(state.isRunning).toBe(false);
    expect(state.progress).toBe(0);
  });

  it('starts an operation', () => {
    useOperationStore.getState().startOperation('export', 'Exporting...');
    const state = useOperationStore.getState();
    expect(state.type).toBe('export');
    expect(state.isRunning).toBe(true);
    expect(state.message).toBe('Exporting...');
    expect(state.progress).toBe(0);
  });

  it('updates progress', () => {
    useOperationStore.getState().startOperation('export', 'Exporting...');
    useOperationStore.getState().updateProgress(50, 'photo.jpg');
    const state = useOperationStore.getState();
    expect(state.progress).toBe(50);
    expect(state.currentFileName).toBe('photo.jpg');
  });

  it('completes an operation', () => {
    useOperationStore.getState().startOperation('export', 'Exporting...');
    useOperationStore.getState().completeOperation('Done!');
    const state = useOperationStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.progress).toBe(100);
    expect(state.completionMessage).toBe('Done!');
  });

  it('clears completion message after 4 seconds', () => {
    useOperationStore.getState().startOperation('export', 'Exporting...');
    useOperationStore.getState().completeOperation('Done!');
    jest.advanceTimersByTime(4000);
    const state = useOperationStore.getState();
    expect(state.completionMessage).toBe('');
    expect(state.type).toBe('idle');
  });

  it('resets to initial state', () => {
    useOperationStore.getState().startOperation('export', 'Exporting...');
    useOperationStore.getState().updateProgress(75, 'file.jpg');
    useOperationStore.getState().reset();
    const state = useOperationStore.getState();
    expect(state.type).toBe('idle');
    expect(state.isRunning).toBe(false);
    expect(state.progress).toBe(0);
  });
});
