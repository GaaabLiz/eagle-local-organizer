import React from 'react';
import { X } from 'lucide-react';
import type { MediaItem } from '../../types';
import { getAllMetadata } from '../../services/metadataService';
import { formatDateTime } from '../../utils/dateUtils';

interface MetadataDialogProps {
  open: boolean;
  item: MediaItem | null;
  onClose: () => void;
}

export const MetadataDialog: React.FC<MetadataDialogProps> = ({
  open,
  item,
  onClose,
}) => {
  if (!open || !item) return null;

  const meta = getAllMetadata(item);

  const pairs: Array<{ label: string; value: string }> = [
    { label: 'File name', value: `${item.name}.${item.ext}` },
    { label: 'File path', value: item.filePath },
    { label: 'Type', value: item.type },
    {
      label: 'Dimensions',
      value: item.width && item.height ? `${item.width} × ${item.height}` : '—',
    },
    {
      label: 'File size',
      value: item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : '—',
    },
    {
      label: 'Creation date (filesystem)',
      value: meta.creationDate ? formatDateTime(meta.creationDate) : '—',
    },
    {
      label: 'Modification date (filesystem)',
      value: meta.modificationDate ? formatDateTime(meta.modificationDate) : '—',
    },
    {
      label: 'Imported into Eagle',
      value: formatDateTime(meta.eagleImportedAt),
    },
    {
      label: 'Modified in Eagle',
      value: formatDateTime(meta.eagleModifiedAt),
    },
    {
      label: 'EXIF DateTimeOriginal',
      value: meta.exifDateTimeOriginal || '—',
    },
    {
      label: 'EXIF DateTimeDigitized',
      value: meta.exifDateTimeDigitized || '—',
    },
    { label: 'EXIF DateTime', value: meta.exifModifyDate || '—' },
    { label: 'Camera make', value: meta.cameraMake || '—' },
    { label: 'Camera model', value: meta.cameraModel || '—' },
    { label: 'Lens', value: meta.lens || '—' },
    { label: 'Focal length', value: meta.focalLength || '—' },
    { label: 'Aperture', value: meta.aperture || '—' },
    { label: 'Shutter speed', value: meta.shutterSpeed || '—' },
    { label: 'ISO', value: meta.iso || '—' },
    { label: 'GPS Latitude', value: meta.gpsLatitude || '—' },
    { label: 'GPS Longitude', value: meta.gpsLongitude || '—' },
    { label: 'Orientation', value: meta.orientation || '—' },
    { label: 'Color space', value: meta.colorSpace || '—' },
    { label: 'Software', value: meta.software || '—' },
  ];

  const hasAnyExif =
    meta.exifDateTimeOriginal ||
    meta.cameraMake ||
    meta.cameraModel ||
    meta.lens;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog dialog--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <h2 className="dialog__title">Metadata — {item.name}</h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dialog__body">
          {!hasAnyExif && (
            <p
              style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--spacing-md)',
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              No EXIF metadata available for this media. Showing file and Eagle metadata only.
            </p>
          )}

          {pairs.map((p) => (
            <div key={p.label} className="info-pair">
              <span className="info-pair__label">{p.label}</span>
              <span className="info-pair__value">{p.value}</span>
            </div>
          ))}
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
