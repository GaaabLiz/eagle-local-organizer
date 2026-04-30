import React from 'react';
import { X } from 'lucide-react';
import type { MediaItem } from '../../types';

interface PreviewDialogProps {
  open: boolean;
  item: MediaItem | null;
  onClose: () => void;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  item,
  onClose,
}) => {
  if (!open || !item) return null;

  const isVideo = item.type === 'video';
  // Build file:// URL for local files
  const fileUrl = `file://${item.filePath}`;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        style={{
          minWidth: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <h2 className="dialog__title">
            {item.name}.{item.ext}
          </h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div
          className="dialog__body"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-md)',
            minHeight: '300px',
          }}
        >
          {isVideo ? (
            <video
              src={fileUrl}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                borderRadius: 'var(--radius-md)',
              }}
            />
          ) : (
            <img
              src={fileUrl}
              alt={item.name}
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                borderRadius: 'var(--radius-md)',
                objectFit: 'contain',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
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
