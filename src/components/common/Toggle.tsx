import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div
      className={`toggle ${disabled ? 'toggle--disabled' : ''}`}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }
      }}
    >
      <div className={`toggle__track ${checked ? 'toggle__track--active' : ''}`}>
        <div className="toggle__thumb" />
      </div>
      <span className="toggle__label">{label}</span>
    </div>
  );
};
