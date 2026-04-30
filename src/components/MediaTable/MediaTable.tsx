import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  Image,
  Video,
  File,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Aperture,
  FileText,
  FolderOpen,
  Trash2,
  Eye,
  FileSearch,
} from 'lucide-react';
import type { MediaItem } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getCreationDate } from '../../services/metadataService';
import { getPrimaryDestination } from '../../services/exportService';
import { useSettingsStore } from '../../hooks/useSettingsStore';

interface MediaTableProps {
  items: MediaItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveItem: (id: string) => void;
  onOpenInEagle: (id: string) => void;
  onViewMetadata: (item: MediaItem) => void;
  onPreview: (item: MediaItem) => void;
}

const columnHelper = createColumnHelper<MediaItem>();

const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'photo':
      return <Image size={14} style={{ color: 'var(--color-info)' }} />;
    case 'video':
      return <Video size={14} style={{ color: 'var(--color-warning)' }} />;
    default:
      return <File size={14} style={{ color: 'var(--color-text-tertiary)' }} />;
  }
};

export const MediaTable: React.FC<MediaTableProps> = ({
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onRemoveItem,
  onOpenInEagle,
  onViewMetadata,
  onPreview,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: MediaItem;
  } | null>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const settings = useSettingsStore((s) => s.settings);

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const rowSelection: RowSelectionState = useMemo(() => {
    const sel: RowSelectionState = {};
    items.forEach((item, idx) => {
      if (selectedIds.has(item.id)) sel[idx] = true;
    });
    return sel;
  }, [items, selectedIds]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            className="media-table__checkbox"
            checked={allSelected}
            onChange={() => (allSelected ? onDeselectAll() : onSelectAll())}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="media-table__checkbox"
            checked={selectedIds.has(row.original.id)}
            onChange={() => onToggleSelect(row.original.id)}
          />
        ),
        size: 36,
      }),
      columnHelper.display({
        id: 'thumbnail',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="media-table__thumbnail"
              onClick={() => onPreview(item)}
              title="Click to preview"
            >
              {item.type === 'photo' && item.thumbnailPath ? (
                <img
                  src={`file://${item.thumbnailPath}`}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<span style="opacity:0.4"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></span>';
                  }}
                />
              ) : item.type === 'video' ? (
                <Video size={20} style={{ opacity: 0.4 }} />
              ) : (
                <File size={20} style={{ opacity: 0.4 }} />
              )}
            </div>
          );
        },
        size: 56,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <span title={`${info.getValue()}.${info.row.original.ext}`}>
            {info.getValue()}.{info.row.original.ext}
          </span>
        ),
        sortingFn: 'alphanumeric',
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => {
          const row = info.row.original;
          const displayType = row.isSidecar ? 'sidecar' : info.getValue();
          return (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TypeIcon type={info.getValue()} />
              {displayType}
            </span>
          );
        },
        sortingFn: 'alphanumeric',
        size: 70,
      }),
      columnHelper.accessor(
        (row) => getCreationDate(row),
        {
          id: 'creationDate',
          header: 'Date',
          cell: (info) => formatDate(info.getValue()),
          sortingFn: 'basic',
          size: 100,
        }
      ),
      columnHelper.accessor(
        (row) =>
          getPrimaryDestination(
            row,
            settings.folderStructure,
            settings.exportDestination
          ),
        {
          id: 'destination',
          header: 'Destination',
          cell: (info) => (
            <span title={info.getValue()}>
              <FolderOpen
                size={12}
                style={{
                  display: 'inline',
                  marginRight: '4px',
                  opacity: 0.5,
                }}
              />
              {info.getValue()}
            </span>
          ),
          sortingFn: 'alphanumeric',
          size: 200,
        }
      ),
      columnHelper.accessor('hasExif', {
        id: 'metadata',
        header: 'Meta',
        cell: (info) => {
          const item = info.row.original;
          if (item.isSidecar) return null;
          const hasSidecar = !!item.hasSidecar;
          const hasExif = !!info.getValue();
          return (
            <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span
                className={`media-table__exif-icon ${hasSidecar ? 'media-table__exif-icon--has-exif' : ''}`}
                title={hasSidecar ? 'Sidecar linked: Yes' : 'Sidecar linked: No'}
              >
                <FileText size={13} />
              </span>
              <span
                className={`media-table__exif-icon ${hasExif ? 'media-table__exif-icon--has-exif' : ''}`}
                title={hasExif ? 'Exif metadata: Yes' : 'Exif metadata: No'}
              >
                <Aperture size={13} />
              </span>
            </span>
          );
        },
        sortingFn: 'basic',
        size: 60,
      }),
    ],
    [allSelected, selectedIds, settings, onDeselectAll, onSelectAll, onToggleSelect, onPreview]
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: MediaItem) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, item });
    },
    []
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        contextRef.current &&
        !contextRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [contextMenu]);

  if (items.length === 0) {
    return (
      <div className="media-table__empty">
        <FolderOpen size={64} className="media-table__empty-icon" />
        <span className="media-table__empty-text">No media loaded</span>
        <span className="media-table__empty-hint">
          Click "Add" to import media from Eagle
        </span>
      </div>
    );
  }

  return (
    <div className="media-table-container">
      <table className="media-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={
                    header.id === 'select'
                      ? 'col-checkbox'
                      : header.id === 'thumbnail'
                        ? 'col-thumbnail'
                        : header.id === 'name'
                          ? 'col-name'
                          : header.id === 'type'
                            ? 'col-type'
                            : header.id === 'creationDate'
                              ? 'col-date'
                              : header.id === 'destination'
                                ? 'col-destination'
                                : header.id === 'metadata'
                                  ? 'col-exif'
                                  : ''
                  }
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    width: header.getSize(),
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getCanSort() && (
                    <span
                      className={`sort-indicator ${
                        header.column.getIsSorted()
                          ? 'sort-indicator--active'
                          : ''
                      }`}
                    >
                      {header.column.getIsSorted() === 'asc' ? (
                        <ChevronUp size={12} />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={10} />
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={
                selectedIds.has(row.original.id) ? 'selected' : ''
              }
              onContextMenu={(e) => handleContextMenu(e, row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextRef}
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="dropdown__item"
            onClick={() => {
              onRemoveItem(contextMenu.item.id);
              setContextMenu(null);
            }}
          >
            <Trash2 size={12} />
            <span className="dropdown__item-text">Remove from list</span>
          </button>
          <button
            className="dropdown__item"
            onClick={() => {
              onOpenInEagle(contextMenu.item.id);
              setContextMenu(null);
            }}
          >
            <Eye size={12} />
            <span className="dropdown__item-text">Open in Eagle</span>
          </button>
          {!contextMenu.item.isSidecar && (
            <button
              className="dropdown__item"
              onClick={() => {
                onViewMetadata(contextMenu.item);
                setContextMenu(null);
              }}
            >
              <FileSearch size={12} />
              <span className="dropdown__item-text">View metadata</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
