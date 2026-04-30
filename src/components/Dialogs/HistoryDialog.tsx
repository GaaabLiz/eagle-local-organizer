import React from 'react';
import { X, CheckCircle, AlertCircle, Copy, MinusCircle } from 'lucide-react';
import type { ExportSession, ExportFileStatus } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';
import { pluralize } from '../../utils/formatUtils';

interface HistoryDialogProps {
  open: boolean;
  session: ExportSession | null;
  onClose: () => void;
}

const StatusIcon: React.FC<{ status: ExportFileStatus }> = ({ status }) => {
  switch (status) {
    case 'success':
      return <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />;
    case 'error':
      return <AlertCircle size={14} style={{ color: 'var(--color-error)' }} />;
    case 'duplicate':
      return <Copy size={14} style={{ color: 'var(--color-warning)' }} />;
    case 'skipped':
      return <MinusCircle size={14} style={{ color: 'var(--color-text-tertiary)' }} />;
  }
};

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  open,
  session,
  onClose,
}) => {
  if (!open || !session) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog dialog--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <h2 className="dialog__title">Export Details</h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dialog__body">
          {/* Session summary */}
          <div className="dialog-section">
            <h3 className="dialog-section__title">Summary</h3>
            <div className="info-pair">
              <span className="info-pair__label">Date</span>
              <span className="info-pair__value">
                {formatDateTime(session.date)}
              </span>
            </div>
            <div className="info-pair">
              <span className="info-pair__label">Destination</span>
              <span className="info-pair__value">
                {session.destinationFolder}
              </span>
            </div>
            <div className="info-pair">
              <span className="info-pair__label">Structure</span>
              <span className="info-pair__value">
                {session.folderStructure}
              </span>
            </div>
            <div className="info-pair">
              <span className="info-pair__label">Total items</span>
              <span className="info-pair__value">
                {pluralize(session.itemCount, 'item')}
              </span>
            </div>
            <div className="info-pair">
              <span className="info-pair__label">Successful</span>
              <span className="info-pair__value" style={{ color: 'var(--color-success)' }}>
                {session.successCount}
              </span>
            </div>
            {session.errorCount > 0 && (
              <div className="info-pair">
                <span className="info-pair__label">Errors</span>
                <span className="info-pair__value" style={{ color: 'var(--color-error)' }}>
                  {session.errorCount}
                </span>
              </div>
            )}
            {session.duplicateCount > 0 && (
              <div className="info-pair">
                <span className="info-pair__label">Duplicates</span>
                <span className="info-pair__value" style={{ color: 'var(--color-warning)' }}>
                  {session.duplicateCount}
                </span>
              </div>
            )}
            {session.dryRun && (
              <div className="info-pair">
                <span className="info-pair__label">Mode</span>
                <span className="info-pair__value" style={{ color: 'var(--color-info)' }}>
                  Dry-run (no files copied)
                </span>
              </div>
            )}
          </div>

          {/* Exported files table */}
          <div className="dialog-section">
            <h3 className="dialog-section__title">Exported files</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="media-table" style={{ tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>Status</th>
                    <th>Name</th>
                    <th>Destination</th>
                    <th style={{ width: '140px' }}>Date</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {session.items.map((file, idx) => (
                    <tr key={`${file.id}-${idx}`}>
                      <td style={{ textAlign: 'center' }}>
                        <StatusIcon status={file.status} />
                      </td>
                      <td title={`${file.name}.${file.ext}`}>
                        {file.name}.{file.ext}
                      </td>
                      <td title={file.destinationPath}>
                        {file.destinationPath}
                      </td>
                      <td>{formatDateTime(file.exportedAt)}</td>
                      <td
                        style={{ color: 'var(--color-error)' }}
                        title={file.errorMessage || ''}
                      >
                        {file.errorMessage || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="dialog__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
