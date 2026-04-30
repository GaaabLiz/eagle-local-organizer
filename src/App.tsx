import React, { useState, useCallback } from 'react';
import { TitleBar } from './components/TitleBar/TitleBar';
import { MediaTable } from './components/MediaTable/MediaTable';
import { StatusBar } from './components/StatusBar/StatusBar';
import { AddElementsDialog } from './components/Dialogs/AddElementsDialog';
import { SettingsDialog } from './components/Dialogs/SettingsDialog';
import { HistoryDialog } from './components/Dialogs/HistoryDialog';
import { InfoDialog } from './components/Dialogs/InfoDialog';
import { MetadataDialog } from './components/Dialogs/MetadataDialog';
import { PreviewDialog } from './components/Dialogs/PreviewDialog';
import { ConfirmDialog } from './components/Dialogs/ConfirmDialog';
import { SidecarConflictDialog } from './components/Dialogs/SidecarConflictDialog';
import { useMediaStore } from './hooks/useMediaStore';
import { useSettingsStore } from './hooks/useSettingsStore';
import { useHistoryStore } from './hooks/useHistoryStore';
import { useOperationStore } from './hooks/useOperationStore';
import { exportItems } from './services/exportService';
import { clearCache, resetPlugin } from './services/storageService';
import { clearPreviewCache } from './services/thumbnailCacheService';
import { openInEagle } from './services/eagleApiService';
import { formatProgress } from './utils/formatUtils';
import type { MediaItem, ExportSession, PluginSettings } from './types';

type DialogState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'settings' }
  | { type: 'history'; session: ExportSession }
  | { type: 'info' }
  | { type: 'metadata'; item: MediaItem }
  | { type: 'preview'; item: MediaItem }
  | { type: 'confirm-export' }
  | { type: 'confirm-clear' }
  | { type: 'confirm-cache' }
  | { type: 'confirm-reset' }
  | { type: 'confirm-generate-sidecars' }
  | { type: 'confirm-remove-sidecars' }
  | { type: 'sidecar-conflict' };

const App: React.FC = () => {
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

  // Stores
  const items = useMediaStore((s) => s.items);
  const selectedIds = useMediaStore((s) => s.selectedIds);
  const toggleSelected = useMediaStore((s) => s.toggleSelected);
  const selectAll = useMediaStore((s) => s.selectAll);
  const deselectAll = useMediaStore((s) => s.deselectAll);
  const removeItem = useMediaStore((s) => s.removeItem);
  const clearAll = useMediaStore((s) => s.clearAll);
  const fetchSelectedItems = useMediaStore((s) => s.fetchSelectedItems);
  const fetchItemsByFolder = useMediaStore((s) => s.fetchItemsByFolder);
  const fetchItemsByTag = useMediaStore((s) => s.fetchItemsByTag);
  const refreshItems = useMediaStore((s) => s.refreshItems);
  const generateSidecars = useMediaStore((s) => s.generateSidecars);
  const removeSidecars = useMediaStore((s) => s.removeSidecars);
  const sidecarConflicts = useMediaStore((s) => s.sidecarConflicts);
  const resolveSidecarConflict = useMediaStore((s) => s.resolveSidecarConflict);
  const clearSidecarConflicts = useMediaStore((s) => s.clearSidecarConflicts);

  const settings = useSettingsStore((s) => s.settings);
  const saveSettings = useSettingsStore((s) => s.saveSettings);

  const sessions = useHistoryStore((s) => s.sessions);
  const addSession = useHistoryStore((s) => s.addSession);

  const operation = useOperationStore();

  const closeDialog = useCallback(() => setDialog({ type: 'none' }), []);

  // Check if there are selected items in Eagle (best-effort check)
  const [hasEagleSelection, setHasEagleSelection] = useState(true);

  const handleAddSelected = useCallback(async (checkForSidecars: boolean) => {
    await fetchSelectedItems(checkForSidecars);
    if (checkForSidecars && useMediaStore.getState().sidecarConflicts.length > 0) {
      setDialog({ type: 'sidecar-conflict' });
    }
  }, [fetchSelectedItems]);

  const handleAddByFolder = useCallback(
    async (folderId: string, folderName: string, checkForSidecars: boolean) => {
      await fetchItemsByFolder(folderId, folderName, checkForSidecars);
      if (checkForSidecars && useMediaStore.getState().sidecarConflicts.length > 0) {
        setDialog({ type: 'sidecar-conflict' });
      }
    },
    [fetchItemsByFolder]
  );

  const handleAddByTag = useCallback(
    async (tagName: string, checkForSidecars: boolean) => {
      await fetchItemsByTag(tagName, checkForSidecars);
      if (checkForSidecars && useMediaStore.getState().sidecarConflicts.length > 0) {
        setDialog({ type: 'sidecar-conflict' });
      }
    },
    [fetchItemsByTag]
  );

  const handleExport = useCallback(async () => {
    closeDialog();
    operation.startOperation('export', 'Exporting...');

    try {
      const session = await exportItems(
        items,
        settings,
        (current, total, fileName) => {
          const pct = formatProgress(current, total);
          operation.updateProgress(pct, fileName);
        }
      );

      addSession(session);

      const msg =
        session.errorCount > 0
          ? `Export completed with ${session.errorCount} error(s)`
          : settings.dryRun
            ? 'Dry-run completed'
            : `Export completed (${session.successCount} files)`;
      operation.completeOperation(msg);
    } catch (err) {
      operation.completeOperation(
        `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, [items, settings, operation, addSession, closeDialog]);

  const handleUpdate = useCallback(async () => {
    try {
      await refreshItems();
    } catch {
      operation.completeOperation('Update failed');
    }
  }, [operation, refreshItems]);

  const handleClearCache = useCallback(() => {
    clearCache();
    clearPreviewCache();
    closeDialog();
  }, [closeDialog]);

  const handleResetPlugin = useCallback(() => {
    resetPlugin();
    clearPreviewCache();
    clearAll();
    closeDialog();
    window.location.reload();
  }, [clearAll, closeDialog]);

  const handleGenerateSidecars = useCallback(async () => {
    closeDialog();
    operation.startOperation('sidecar', 'Generating sidecars...');
    try {
      await generateSidecars(settings.importSidecars);
      const count = useMediaStore.getState().items.filter((i) => i.isSidecar).length;
      operation.completeOperation(`Generated ${count} sidecar file(s)`);
    } catch (err) {
      operation.completeOperation(
        `Sidecar generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, [closeDialog, operation, generateSidecars, settings.importSidecars]);

  const handleRemoveSidecars = useCallback(() => {
    closeDialog();
    removeSidecars();
    operation.completeOperation('Sidecars removed from list');
  }, [closeDialog, removeSidecars, operation]);

  const handleResolveSidecarConflict = useCallback(
    (mediaId: string, chosenSidecarId: string | null) => {
      if (chosenSidecarId) {
        resolveSidecarConflict(mediaId, chosenSidecarId);
      } else {
        // Skip — just remove this conflict
        resolveSidecarConflict(mediaId, '');
      }
      // Close dialog if no more conflicts
      if (useMediaStore.getState().sidecarConflicts.length === 0) {
        closeDialog();
      }
    },
    [resolveSidecarConflict, closeDialog]
  );

  const handleOpenInEagle = useCallback((id: string) => {
    openInEagle(id);
  }, []);

  // Try to check selection on dialog open
  const handleOpenAddDialog = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eagleApi = (window as any).eagle;
      if (eagleApi?.item?.getSelected) {
        const sel = await eagleApi.item.getSelected();
        setHasEagleSelection(sel && sel.length > 0);
      }
    } catch {
      setHasEagleSelection(true);
    }
    setDialog({ type: 'add' });
  }, []);

  return (
    <>
      <TitleBar
        hasItems={items.length > 0}
        isOperationRunning={operation.isRunning}
        sessions={sessions}
        onAddClick={handleOpenAddDialog}
        onExportClick={() => setDialog({ type: 'confirm-export' })}
        onUpdateClick={handleUpdate}
        onClearClick={() => setDialog({ type: 'confirm-clear' })}
        onSettingsClick={() => setDialog({ type: 'settings' })}
        onHistorySelect={(session) => setDialog({ type: 'history', session })}
        onClearCache={() => setDialog({ type: 'confirm-cache' })}
        onResetPlugin={() => setDialog({ type: 'confirm-reset' })}
        onInfoClick={() => setDialog({ type: 'info' })}
        onGenerateSidecars={() => setDialog({ type: 'confirm-generate-sidecars' })}
        onRemoveSidecars={() => setDialog({ type: 'confirm-remove-sidecars' })}
      />

      <MediaTable
        items={items}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelected}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onRemoveItem={removeItem}
        onOpenInEagle={handleOpenInEagle}
        onViewMetadata={(item) => setDialog({ type: 'metadata', item })}
        onPreview={(item) => setDialog({ type: 'preview', item })}
      />

      <StatusBar
        itemCount={items.length}
        selectedCount={selectedIds.size}
        isRunning={operation.isRunning}
        progress={operation.progress}
        currentFileName={operation.currentFileName}
        message={operation.message}
        completionMessage={operation.completionMessage}
      />

      {/* Dialogs */}
      <AddElementsDialog
        open={dialog.type === 'add'}
        onClose={closeDialog}
        onAddSelected={handleAddSelected}
        onAddByFolder={handleAddByFolder}
        onAddByTag={handleAddByTag}
        hasSelectedItems={hasEagleSelection}
      />

      <SettingsDialog
        open={dialog.type === 'settings'}
        settings={settings}
        onClose={closeDialog}
        onSave={(s: PluginSettings) => saveSettings(s)}
      />

      <HistoryDialog
        open={dialog.type === 'history'}
        session={dialog.type === 'history' ? dialog.session : null}
        onClose={closeDialog}
      />

      <InfoDialog open={dialog.type === 'info'} onClose={closeDialog} />

      <MetadataDialog
        open={dialog.type === 'metadata'}
        item={dialog.type === 'metadata' ? dialog.item : null}
        onClose={closeDialog}
      />

      <PreviewDialog
        open={dialog.type === 'preview'}
        item={dialog.type === 'preview' ? dialog.item : null}
        onClose={closeDialog}
      />

      {/* Confirmation dialogs */}
      <ConfirmDialog
        open={dialog.type === 'confirm-export'}
        title="Export Media"
        message={`Are you sure you want to export ${items.length} item(s)?`}
        detail={
          settings.dryRun
            ? 'Dry-run mode is enabled — no files will be copied.'
            : `Files will be exported to: ${settings.exportDestination}`
        }
        onConfirm={handleExport}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        open={dialog.type === 'confirm-clear'}
        title="Clear All Items"
        message="Are you sure you want to remove all items from the list?"
        detail="This will only remove items from the plugin list. Your files in Eagle will not be affected."
        onConfirm={() => {
          clearAll();
          closeDialog();
        }}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        open={dialog.type === 'confirm-cache'}
        title="Clear Cache"
        message="Are you sure you want to clear the cache? This action cannot be undone."
        onConfirm={handleClearCache}
        onCancel={closeDialog}
        danger
      />

      <ConfirmDialog
        open={dialog.type === 'confirm-reset'}
        title="Reset Plugin"
        message="Are you sure you want to reset the plugin? This action cannot be undone."
        detail="All settings, history, and loaded items will be permanently deleted."
        onConfirm={handleResetPlugin}
        onCancel={closeDialog}
        danger
      />

      <ConfirmDialog
        open={dialog.type === 'confirm-generate-sidecars'}
        title="Generate Sidecars"
        message={`Generate XMP sidecar files for ${items.filter((i) => !i.isSidecar).length} media item(s)?`}
        detail={
          settings.importSidecars
            ? 'Generated sidecars will also be imported into Eagle.'
            : 'Sidecars will be added to the plugin list only.'
        }
        onConfirm={handleGenerateSidecars}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        open={dialog.type === 'confirm-remove-sidecars'}
        title="Remove Sidecars"
        message="Remove all sidecar files from the plugin list?"
        detail="This only removes sidecar items from the plugin list. Files in Eagle are not affected."
        onConfirm={handleRemoveSidecars}
        onCancel={closeDialog}
      />

      <SidecarConflictDialog
        open={dialog.type === 'sidecar-conflict'}
        conflicts={sidecarConflicts}
        onResolve={handleResolveSidecarConflict}
        onClose={() => {
          clearSidecarConflicts();
          closeDialog();
        }}
      />
    </>
  );
};

export default App;
