import React, { useState } from 'react';
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
  // Use cached preview if available, otherwise fall back to full file
  const previewSrc = item.cachedPreviewPath
    ? `file://${item.cachedPreviewPath}`
    : item.thumbnailPath
      ? `file://${item.thumbnailPath}`
      : `file://${item.filePath}`;
  const fullSrc = `file://${item.filePath}`;

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
              src={fullSrc}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                borderRadius: 'var(--radius-md)',
              }}
            />
          ) : (
            <PreviewImage previewSrc={previewSrc} fullSrc={fullSrc} alt={item.name} />
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

/**
 * Image preview component: shows cached/thumbnail preview instantly,
 * then progressively loads the full-res image in the background.
 */
const PreviewImage: React.FC<{
  previewSrc: string;
  fullSrc: string;
  alt: string;
}> = ({ previewSrc, fullSrc, alt }) => {
  const [src, setSrc] = useState(previewSrc);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '60vh',
          borderRadius: 'var(--radius-md)',
          objectFit: 'contain',
          opacity: loaded ? 1 : 0.85,
          transition: 'opacity 0.2s ease',
        }}
        onLoad={() => {
          setLoaded(true);
          // After preview loads, start loading full-res in background
          if (src !== fullSrc) {
            const img = new Image();
            img.onload = () => setSrc(fullSrc);
            img.src = fullSrc;
          }
        }}
        onError={(e) => {
          // If cached preview fails, fall back to full source
          if (src !== fullSrc) {
            setSrc(fullSrc);
          } else {
            (e.target as HTMLImageElement).style.display = 'none';
          }
        }}
      />
    </>
  );
};
