import React from 'react';
import { X, FileText, Check } from 'lucide-react';
import type { SidecarConflict } from '../../hooks/useMediaStore';
import { formatDateTime } from '../../utils/dateUtils';

interface SidecarConflictDialogProps {
  open: boolean;
  conflicts: SidecarConflict[];
  onResolve: (mediaId: string, chosenSidecarId: string | null) => void;
  onClose: () => void;
}

export const SidecarConflictDialog: React.FC<SidecarConflictDialogProps> = ({
  open,
  conflicts,
  onResolve,
  onClose,
}) => {
  if (!open || conflicts.length === 0) return null;

  const current = conflicts[0];
  const remaining = conflicts.length - 1;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog dialog--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <h2 className="dialog__title">Multiple Sidecars Found</h2>
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
            Multiple sidecar files were found for{' '}
            <strong>{current.mediaItem.name}.{current.mediaItem.ext}</strong>.
            Please select the correct one:
          </p>

          {remaining > 0 && (
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-tertiary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              {remaining} more conflict(s) to resolve after this.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {current.candidates.map((candidate) => (
              <button
                key={candidate.id}
                className="btn btn--secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                }}
                onClick={() => onResolve(current.mediaItem.id, candidate.id)}
              >
                <FileText size={14} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                    {candidate.name}.{candidate.ext}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-tertiary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {candidate.filePath}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                    Size: {(candidate.size / 1024).toFixed(1)} KB
                    {' • '}
                    Modified: {formatDateTime(candidate.modifiedAt)}
                  </div>
                </div>
                <Check size={14} style={{ opacity: 0.3, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
        <div className="dialog__footer">
          <button
            className="btn btn--secondary"
            onClick={() => onResolve(current.mediaItem.id, null)}
          >
            Skip
          </button>
          <button className="btn btn--secondary" onClick={onClose}>
            Skip All
          </button>
        </div>
      </div>
    </div>
  );
};
