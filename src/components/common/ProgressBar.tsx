import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div className={`statusbar__progress-bar ${className}`}>
      <div
        className="statusbar__progress-fill"
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};
