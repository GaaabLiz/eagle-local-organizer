import React from 'react';
import { X } from 'lucide-react';
import type { MediaItem } from '../../types';
import { getAllMetadata } from '../../services/metadataService';
import { parseSidecarMetadata } from '../../services/sidecarService';
import { useMediaStore } from '../../hooks/useMediaStore';
import { formatDateTime } from '../../utils/dateUtils';

interface MetadataDialogProps {
  open: boolean;
  item: MediaItem | null;
  onClose: () => void;
}

interface InfoPair {
  label: string;
  value: string;
}

const Section: React.FC<{ title: string; pairs: InfoPair[] }> = ({ title, pairs }) => (
  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
    <h3
      style={{
        fontSize: 'var(--font-size-sm)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-sm)',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 'var(--spacing-xs)',
      }}
    >
      {title}
    </h3>
    {pairs.map((p) => (
      <div key={p.label} className="info-pair">
        <span className="info-pair__label">{p.label}</span>
        <span className="info-pair__value">{p.value}</span>
      </div>
    ))}
  </div>
);

export const MetadataDialog: React.FC<MetadataDialogProps> = ({
  open,
  item,
  onClose,
}) => {
  if (!open || !item) return null;

  const meta = getAllMetadata(item);
  const items = useMediaStore.getState().items;

  // Find linked sidecar
  const linkedSidecar = item.hasSidecar && item.sidecarId
    ? items.find((i) => i.id === item.sidecarId)
    : undefined;

  const sidecarMeta = linkedSidecar
    ? parseSidecarMetadata(linkedSidecar.filePath)
    : undefined;

  // Section 1: File Info
  const fileInfo: InfoPair[] = [
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
      label: 'Creation date',
      value: meta.creationDate ? formatDateTime(meta.creationDate) : '—',
    },
    {
      label: 'Modification date',
      value: meta.modificationDate ? formatDateTime(meta.modificationDate) : '—',
    },
  ];

  // Section 2: Eagle Info
  const eagleInfo: InfoPair[] = [
    { label: 'Imported at', value: formatDateTime(meta.eagleImportedAt) },
    { label: 'Modified at', value: formatDateTime(meta.eagleModifiedAt) },
    { label: 'Eagle ID', value: item.id },
    {
      label: 'Tags',
      value: item.tags && item.tags.length > 0 ? item.tags.join(', ') : '—',
    },
  ];

  // Section 3: Sidecar Info
  const sidecarInfo: InfoPair[] = [
    {
      label: 'Sidecar linked',
      value: linkedSidecar ? 'Yes' : 'No',
    },
  ];
  if (linkedSidecar) {
    sidecarInfo.push(
      { label: 'Sidecar file', value: `${linkedSidecar.name}.${linkedSidecar.ext}` },
      { label: 'Sidecar path', value: linkedSidecar.filePath },
    );
    if (sidecarMeta) {
      for (const [key, value] of Object.entries(sidecarMeta)) {
        sidecarInfo.push({ label: `XMP ${key}`, value });
      }
    }
  }

  // Section 4: EXIF
  const hasAnyExif = meta.exifDateTimeOriginal || meta.cameraMake || meta.cameraModel || meta.lens;
  const exifInfo: InfoPair[] = hasAnyExif
    ? [
        { label: 'DateTimeOriginal', value: meta.exifDateTimeOriginal || '—' },
        { label: 'DateTimeDigitized', value: meta.exifDateTimeDigitized || '—' },
        { label: 'DateTime', value: meta.exifModifyDate || '—' },
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
      ]
    : [{ label: 'EXIF data', value: 'No EXIF metadata available' }];

  // Section 5: Date Info (priority: EXIF > Sidecar > Filesystem)
  let dateSource: string;
  let primaryCreateDate: string;
  let primaryModifyDate: string;

  if (meta.exifDateTimeOriginal) {
    dateSource = 'Dates calculated from EXIF metadata of the media file';
    primaryCreateDate = meta.exifDateTimeOriginal;
    primaryModifyDate = meta.exifModifyDate || meta.exifDateTimeOriginal;
  } else if (sidecarMeta?.createDate) {
    dateSource = 'Dates calculated from the sidecar file';
    primaryCreateDate = sidecarMeta.createDate;
    primaryModifyDate = sidecarMeta.modifyDate || sidecarMeta.createDate;
  } else {
    dateSource = 'Dates calculated from the media file';
    primaryCreateDate = meta.creationDate ? formatDateTime(meta.creationDate) : '—';
    primaryModifyDate = meta.modificationDate ? formatDateTime(meta.modificationDate) : '—';
  }

  const dateInfo: InfoPair[] = [
    { label: 'Source', value: dateSource },
    { label: 'Creation date', value: primaryCreateDate },
    { label: 'Modification date', value: primaryModifyDate },
  ];

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
        <div
          className="dialog__body"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          <Section title="File Info" pairs={fileInfo} />
          <Section title="Eagle.cool Info" pairs={eagleInfo} />
          <Section title="Sidecar Info" pairs={sidecarInfo} />
          <Section title="EXIF" pairs={exifInfo} />
          <Section title="Date Info" pairs={dateInfo} />
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
