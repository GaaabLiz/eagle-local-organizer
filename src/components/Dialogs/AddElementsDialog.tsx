import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { AddMode } from '../../types';
import { SearchableSelect } from '../common/SearchableSelect';
import { getAllFolders, getAllTags, flattenFolders } from '../../services/eagleApiService';

interface AddElementsDialogProps {
  open: boolean;
  onClose: () => void;
  onAddSelected: () => void;
  onAddByFolder: (folderId: string, folderName: string) => void;
  onAddByTag: (tagName: string) => void;
  hasSelectedItems: boolean;
}

export const AddElementsDialog: React.FC<AddElementsDialogProps> = ({
  open,
  onClose,
  onAddSelected,
  onAddByFolder,
  onAddByTag,
  hasSelectedItems,
}) => {
  const [mode, setMode] = useState<AddMode>('selected');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [folders, setFolders] = useState<Array<{ value: string; label: string }>>([]);
  const [tags, setTags] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [eagleFolders, eagleTags] = await Promise.all([
          getAllFolders(),
          getAllTags(),
        ]);

        const flatFolders = flattenFolders(eagleFolders);
        setFolders(
          flatFolders.map((f) => ({
            value: f.id,
            label: f.fullPath,
          }))
        );

        setTags(
          eagleTags.map((t) => ({
            value: t.name,
            label: `${t.name} (${t.count})`,
          }))
        );
      } catch (err) {
        console.error('Failed to load folders/tags:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open]);

  if (!open) return null;

  const canAdd =
    mode === 'selected'
      ? hasSelectedItems
      : mode === 'folder'
        ? selectedFolderId !== ''
        : selectedTag !== '';

  const handleAdd = () => {
    switch (mode) {
      case 'selected':
        onAddSelected();
        break;
      case 'folder': {
        const folder = folders.find((f) => f.value === selectedFolderId);
        onAddByFolder(selectedFolderId, folder?.label || '');
        break;
      }
      case 'tag':
        onAddByTag(selectedTag);
        break;
    }
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__header">
          <h2 className="dialog__title">Add Elements</h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dialog__body">
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            Select the mode to add media
          </p>

          <div className="form-group">
            <label className="form-label">Source mode</label>
            <select
              className="form-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as AddMode)}
            >
              <option value="selected">Selected items</option>
              <option value="folder">Folder</option>
              <option value="tag">Tag</option>
            </select>
          </div>

          {mode === 'selected' && !hasSelectedItems && (
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-warning)',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              No items are currently selected in Eagle. Select items first.
            </p>
          )}

          {mode === 'folder' && (
            <div className="form-group">
              <label className="form-label">Select folder</label>
              {loading ? (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                  Loading folders...
                </p>
              ) : (
                <SearchableSelect
                  options={folders}
                  value={selectedFolderId}
                  onChange={setSelectedFolderId}
                  placeholder="Search folders..."
                />
              )}
            </div>
          )}

          {mode === 'tag' && (
            <div className="form-group">
              <label className="form-label">Select tag</label>
              {loading ? (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                  Loading tags...
                </p>
              ) : (
                <SearchableSelect
                  options={tags}
                  value={selectedTag}
                  onChange={setSelectedTag}
                  placeholder="Search tags..."
                />
              )}
            </div>
          )}
        </div>
        <div className="dialog__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn--primary"
            disabled={!canAdd}
            onClick={handleAdd}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
