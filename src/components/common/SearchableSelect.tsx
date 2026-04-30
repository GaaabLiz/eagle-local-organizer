import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SearchableSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || '';

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      inputRef.current?.focus();
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  return (
    <div className="searchable-select" ref={ref}>
      <input
        ref={inputRef}
        className="searchable-select__input form-input"
        type="text"
        value={open ? search : selectedLabel}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!open) setOpen(true);
        }}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            setSearch('');
          }
        }}
        readOnly={!open}
      />
      {open && (
        <div className="searchable-select__dropdown">
          {filtered.length === 0 ? (
            <div
              className="searchable-select__option"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No results found
            </div>
          ) : (
            filtered.map((option) => (
              <div
                key={option.value}
                className={`searchable-select__option ${
                  option.value === value
                    ? 'searchable-select__option--selected'
                    : ''
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearch('');
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
