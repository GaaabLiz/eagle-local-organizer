import React from 'react';
import { X, FileText, Camera, Calendar, Info, FolderOpen } from 'lucide-react';
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

const sectionStyles: React.CSSProperties = {
  marginBottom: '16px',
  backgroundColor: 'var(--color-bg-secondary, #1e1e2e)',
  borderRadius: '8px',
  padding: '12px 14px',
  border: '1px solid var(--color-border-light, rgba(255,255,255,0.06))',
};

const sectionHeaderStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--color-border-light, rgba(255,255,255,0.08))',
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const pairStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '5px 0',
  fontSize: '12px',
  gap: '12px',
};

const labelStyles: React.CSSProperties = {
  color: 'var(--color-text-tertiary, #888)',
  fontWeight: 400,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const valueStyles: React.CSSProperties = {
  color: 'var(--color-text-primary)',
  textAlign: 'right',
  wordBreak: 'break-all',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '11px',
};

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  pairs: InfoPair[];
  badge?: { text: string; color: string };
}> = ({ title, icon, pairs, badge }) => (
  <div style={sectionStyles}>
    <div style={sectionHeaderStyles}>
      <span style={{ color: 'var(--color-text-secondary)', display: 'flex' }}>{icon}</span>
      <span style={sectionTitleStyles}>{title}</span>
      {badge && (
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '10px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: badge.color,
            color: '#fff',
          }}
        >
          {badge.text}
        </span>
      )}
    </div>
    {pairs.map((p, idx) => (
      <div key={`${p.label}-${idx}`} style={pairStyles}>
        <span style={labelStyles}>{p.label}</span>
        <span style={valueStyles}>{p.value}</span>
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
    { label: 'Path', value: item.filePath },
    { label: 'Type', value: item.type },
    {
      label: 'Dimensions',
      value: item.width && item.height ? `${item.width} × ${item.height}` : '—',
    },
    {
      label: 'Size',
      value: item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : '—',
    },
    {
      label: 'Created',
      value: meta.creationDate ? formatDateTime(meta.creationDate) : '—',
    },
    {
      label: 'Modified',
      value: meta.modificationDate ? formatDateTime(meta.modificationDate) : '—',
    },
  ];

  // Section 2: Eagle Info
  const eagleInfo: InfoPair[] = [
    { label: 'Imported', value: formatDateTime(meta.eagleImportedAt) },
    { label: 'Modified', value: formatDateTime(meta.eagleModifiedAt) },
    { label: 'ID', value: item.id },
    {
      label: 'Tags',
      value: item.tags && item.tags.length > 0 ? item.tags.join(', ') : '—',
    },
  ];

  // Section 3: Sidecar Info
  const sidecarInfo: InfoPair[] = [];
  if (linkedSidecar) {
    sidecarInfo.push(
      { label: 'File', value: `${linkedSidecar.name}.${linkedSidecar.ext}` },
      { label: 'Path', value: linkedSidecar.filePath },
    );
    if (sidecarMeta) {
      for (const [key, value] of Object.entries(sidecarMeta)) {
        sidecarInfo.push({ label: key, value });
      }
    }
  } else {
    sidecarInfo.push({ label: 'Status', value: 'No sidecar file linked' });
  }

  // Section 4: EXIF
  const hasAnyExif = meta.exifDateTimeOriginal || meta.cameraMake || meta.cameraModel || meta.lens;
  const exifInfo: InfoPair[] = hasAnyExif
    ? [
        { label: 'DateTimeOriginal', value: meta.exifDateTimeOriginal || '—' },
        { label: 'DateTimeDigitized', value: meta.exifDateTimeDigitized || '—' },
        { label: 'DateTime', value: meta.exifModifyDate || '—' },
        { label: 'Make', value: meta.cameraMake || '—' },
        { label: 'Model', value: meta.cameraModel || '—' },
        { label: 'Lens', value: meta.lens || '—' },
        { label: 'Focal length', value: meta.focalLength || '—' },
        { label: 'Aperture', value: meta.aperture || '—' },
        { label: 'Shutter', value: meta.shutterSpeed || '—' },
        { label: 'ISO', value: meta.iso || '—' },
        { label: 'GPS Lat', value: meta.gpsLatitude || '—' },
        { label: 'GPS Lng', value: meta.gpsLongitude || '—' },
        { label: 'Orientation', value: meta.orientation || '—' },
        { label: 'Color space', value: meta.colorSpace || '—' },
        { label: 'Software', value: meta.software || '—' },
      ]
    : [{ label: 'Status', value: 'No EXIF data available' }];

  // Section 5: Date Info (priority: EXIF > Sidecar > Filesystem)
  let dateSource: string;
  let primaryCreateDate: string;
  let primaryModifyDate: string;

  if (meta.exifDateTimeOriginal) {
    dateSource = 'From EXIF metadata';
    primaryCreateDate = meta.exifDateTimeOriginal;
    primaryModifyDate = meta.exifModifyDate || meta.exifDateTimeOriginal;
  } else if (sidecarMeta?.createDate) {
    dateSource = 'From sidecar file';
    primaryCreateDate = sidecarMeta.createDate;
    primaryModifyDate = sidecarMeta.modifyDate || sidecarMeta.createDate;
  } else {
    dateSource = 'From file system';
    primaryCreateDate = meta.creationDate ? formatDateTime(meta.creationDate) : '—';
    primaryModifyDate = meta.modificationDate ? formatDateTime(meta.modificationDate) : '—';
  }

  const dateInfo: InfoPair[] = [
    { label: 'Source', value: dateSource },
    { label: 'Creation', value: primaryCreateDate },
    { label: 'Modification', value: primaryModifyDate },
  ];

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog dialog--wide"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="dialog__header">
          <h2 className="dialog__title" style={{ fontSize: '14px' }}>
            Metadata — {item.name}.{item.ext}
          </h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div
          className="dialog__body"
          style={{
            maxHeight: '72vh',
            overflowY: 'auto',
            padding: '12px',
          }}
        >
          <Section
            title="File"
            icon={<Info size={13} />}
            pairs={fileInfo}
          />
          <Section
            title="Eagle.cool"
            icon={<FolderOpen size={13} />}
            pairs={eagleInfo}
          />
          <Section
            title="Sidecar"
            icon={<FileText size={13} />}
            pairs={sidecarInfo}
            badge={linkedSidecar
              ? { text: 'Linked', color: 'var(--color-success, #22c55e)' }
              : { text: 'None', color: 'var(--color-text-tertiary, #666)' }
            }
          />
          <Section
            title="EXIF"
            icon={<Camera size={13} />}
            pairs={exifInfo}
            badge={hasAnyExif
              ? { text: 'Available', color: 'var(--color-success, #22c55e)' }
              : undefined
            }
          />
          <Section
            title="Dates"
            icon={<Calendar size={13} />}
            pairs={dateInfo}
          />
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
