import React, { useState } from 'react';
import {
  Plus,
  Upload,
  RefreshCw,
  Clock,
  Trash2,
  FileText,
  Settings,
  MoreHorizontal,
  X,
  Link,
  FilePlus,
  FileX,
  RotateCcw,
  Info,
  Eraser,
} from 'lucide-react';
import { Dropdown } from '../common/Dropdown';
import type { ExportSession } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';
import { pluralize } from '../../utils/formatUtils';

interface TitleBarProps {
  hasItems: boolean;
  isOperationRunning: boolean;
  sessions: ExportSession[];
  onAddClick: () => void;
  onExportClick: () => void;
  onUpdateClick: () => void;
  onClearClick: () => void;
  onSettingsClick: () => void;
  onHistorySelect: (session: ExportSession) => void;
  onClearCache: () => void;
  onResetPlugin: () => void;
  onInfoClick: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  hasItems,
  isOperationRunning,
  sessions,
  onAddClick,
  onExportClick,
  onUpdateClick,
  onClearClick,
  onSettingsClick,
  onHistorySelect,
  onClearCache,
  onResetPlugin,
  onInfoClick,
}) => {
  const [, setForceUpdate] = useState(0);
  // Force re-render hack for dropdown close
  const closeDropdowns = () => setForceUpdate((n) => n + 1);

  const disabled = isOperationRunning;

  return (
    <div className="titlebar">
      <span className="titlebar__name">Local Organizer</span>

      <div className="titlebar__actions">
        {/* Add */}
        <button
          className="titlebar__btn titlebar__btn--primary"
          disabled={disabled}
          onClick={onAddClick}
          title="Add media"
        >
          <Plus size={14} />
          Add
        </button>

        {/* Export */}
        {hasItems && (
          <button
            className="titlebar__btn titlebar__btn--primary"
            disabled={disabled}
            onClick={onExportClick}
            title="Export media"
          >
            <Upload size={14} />
            Export
          </button>
        )}

        {/* Update */}
        {hasItems && (
          <button
            className="titlebar__btn titlebar__btn--icon-only"
            disabled={disabled}
            onClick={onUpdateClick}
            title="Refresh items"
          >
            <RefreshCw size={14} />
          </button>
        )}

        {/* History */}
        <Dropdown
          disabled={disabled}
          trigger={
            <button
              className="titlebar__btn titlebar__btn--icon-only"
              disabled={disabled}
              title="Export history"
            >
              <Clock size={14} />
            </button>
          }
        >
          {sessions.length === 0 ? (
            <div
              className="dropdown__item dropdown__item--disabled"
              style={{ justifyContent: 'center' }}
            >
              No export history
            </div>
          ) : (
            sessions.slice(0, 20).map((session) => (
              <button
                key={session.id}
                className="dropdown__item"
                onClick={() => {
                  onHistorySelect(session);
                  closeDropdowns();
                }}
              >
                <Clock size={12} />
                <span className="dropdown__item-text">
                  {formatDateTime(session.date)}
                </span>
                <span className="dropdown__item-hint">
                  {pluralize(session.itemCount, 'item')}
                </span>
              </button>
            ))
          )}
        </Dropdown>

        {/* Clear */}
        {hasItems && (
          <button
            className="titlebar__btn titlebar__btn--icon-only"
            disabled={disabled}
            onClick={onClearClick}
            title="Clear all items"
          >
            <Trash2 size={14} />
          </button>
        )}

        <div className="titlebar__separator" />

        {/* Sidecar */}
        <Dropdown
          disabled={true}
          trigger={
            <button
              className="titlebar__btn titlebar__btn--icon-only"
              disabled={true}
              title="Sidecar options (coming soon)"
            >
              <FileText size={14} />
            </button>
          }
        >
          <button className="dropdown__item dropdown__item--disabled">
            <Link size={12} />
            <span className="dropdown__item-text">Link eagle sidecars</span>
          </button>
          <button className="dropdown__item dropdown__item--disabled">
            <FilePlus size={12} />
            <span className="dropdown__item-text">Generate sidecars</span>
          </button>
          <button className="dropdown__item dropdown__item--disabled">
            <FileX size={12} />
            <span className="dropdown__item-text">Remove sidecars</span>
          </button>
        </Dropdown>

        {/* Settings */}
        <button
          className="titlebar__btn titlebar__btn--icon-only"
          disabled={disabled}
          onClick={onSettingsClick}
          title="Settings"
        >
          <Settings size={14} />
        </button>

        {/* Other options */}
        <Dropdown
          disabled={disabled}
          trigger={
            <button
              className="titlebar__btn titlebar__btn--icon-only"
              disabled={disabled}
              title="More options"
            >
              <MoreHorizontal size={14} />
            </button>
          }
        >
          <button className="dropdown__item" onClick={onClearCache}>
            <Eraser size={12} />
            <span className="dropdown__item-text">Clear cache</span>
          </button>
          <button
            className="dropdown__item dropdown__item--danger"
            onClick={onResetPlugin}
          >
            <RotateCcw size={12} />
            <span className="dropdown__item-text">Reset plugin</span>
          </button>
          <div className="dropdown__separator" />
          <button className="dropdown__item" onClick={onInfoClick}>
            <Info size={12} />
            <span className="dropdown__item-text">Info</span>
          </button>
        </Dropdown>

        <div className="titlebar__separator" />

        {/* Close */}
        <button
          className="titlebar__btn titlebar__btn--icon-only titlebar__btn--close"
          onClick={() => window.close()}
          title="Close plugin"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
