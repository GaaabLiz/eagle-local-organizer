import React from 'react';
import { X, ExternalLink, Info } from 'lucide-react';

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ open, onClose }) => {
  if (!open) return null;

  const openLink = (url: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).eagle?.shell?.openExternal(url);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__header">
          <h2 className="dialog__title">About Local Organizer</h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dialog__body">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-lg) 0',
            }}
          >
            <Info size={48} style={{ color: 'var(--color-accent)', opacity: 0.8 }} />
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
              Local Organizer
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Version 1.0.0
            </p>
          </div>

          <div className="dialog-section">
            <div className="info-pair">
              <span className="info-pair__label">Author</span>
              <span className="info-pair__value">GaaabLiz</span>
            </div>
            <div className="info-pair">
              <span className="info-pair__label">License</span>
              <span className="info-pair__value">MIT</span>
            </div>
            <div className="info-pair">
              <span className="info-pair__label">Platform</span>
              <span className="info-pair__value">All</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center',
              marginTop: 'var(--spacing-lg)',
            }}
          >
            <button
              className="btn btn--ghost"
              onClick={() =>
                openLink(
                  'https://github.com/GaaabLiz/eagle-local-organizer'
                )
              }
            >
              <ExternalLink size={14} />
              GitHub
              <ExternalLink size={12} />
            </button>
            <button
              className="btn btn--ghost"
              onClick={() =>
                openLink(
                  'https://github.com/GaaabLiz/eagle-local-organizer#readme'
                )
              }
            >
              <ExternalLink size={14} />
              Documentation
            </button>
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
