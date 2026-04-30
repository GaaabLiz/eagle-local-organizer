import React, { useState, useEffect } from 'react';
import { X, FolderOpen } from 'lucide-react';
import type { PluginSettings, FolderStructure } from '../../types';
import { Toggle } from '../common/Toggle';
import { showFolderPicker } from '../../services/eagleApiService';

interface SettingsDialogProps {
  open: boolean;
  settings: PluginSettings;
  onClose: () => void;
  onSave: (settings: PluginSettings) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  settings,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<PluginSettings>(settings);

  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  if (!open) return null;

  const handleBrowse = async () => {
    const folder = await showFolderPicker(localSettings.exportDestination);
    if (folder) {
      setLocalSettings((s) => ({ ...s, exportDestination: folder }));
    }
  };

  const handleApply = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__header">
          <h2 className="dialog__title">Settings</h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dialog__body">
          {/* Export Settings */}
          <div className="dialog-section">
            <h3 className="dialog-section__title">Export settings</h3>

            <div className="form-group">
              <label className="form-label">Export destination folder</label>
              <div className="form-row">
                <input
                  className="form-input"
                  type="text"
                  value={localSettings.exportDestination}
                  onChange={(e) =>
                    setLocalSettings((s) => ({
                      ...s,
                      exportDestination: e.target.value,
                    }))
                  }
                  placeholder="/path/to/destination"
                />
                <button className="btn btn--secondary" onClick={handleBrowse}>
                  <FolderOpen size={14} />
                  Browse
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Export folder structure</label>
              <select
                className="form-select"
                value={localSettings.folderStructure}
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    folderStructure: e.target.value as FolderStructure,
                  }))
                }
              >
                <option value="year-month">Year/Month (e.g. 2024/06)</option>
                <option value="year-month-day">
                  Year/Month/Day (e.g. 2024/06/15)
                </option>
                <option value="tag">Tag (e.g. vacation, family)</option>
                <option value="none">No structure (flat)</option>
              </select>
            </div>
          </div>

          {/* Execution Settings */}
          <div className="dialog-section">
            <h3 className="dialog-section__title">Execution settings</h3>
            <div className="form-group">
              <Toggle
                checked={localSettings.dryRun}
                onChange={(v) =>
                  setLocalSettings((s) => ({ ...s, dryRun: v }))
                }
                label="Dry-run mode (simulate export without copying files)"
              />
            </div>
          </div>

          {/* Sidecar Settings */}
          <div className="dialog-section">
            <h3 className="dialog-section__title">Sidecar settings</h3>
            <div className="form-group">
              <Toggle
                checked={localSettings.importSidecars}
                onChange={(v) =>
                  setLocalSettings((s) => ({ ...s, importSidecars: v }))
                }
                label="Import generated sidecar files into Eagle"
                disabled={true}
              />
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-tertiary)',
                  marginTop: 'var(--spacing-xs)',
                }}
              >
                Sidecar features coming soon
              </p>
            </div>
          </div>
        </div>
        <div className="dialog__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
