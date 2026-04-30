import React from 'react';
import { Square } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';
import { pluralize } from '../../utils/formatUtils';

interface StatusBarProps {
  itemCount: number;
  selectedCount: number;
  isRunning: boolean;
  progress: number;
  currentFileName: string;
  message: string;
  completionMessage: string;
  canStop: boolean;
  onStop: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  itemCount,
  selectedCount,
  isRunning,
  progress,
  currentFileName,
  message,
  completionMessage,
  canStop,
  onStop,
}) => {
  if (itemCount === 0 && !isRunning && !completionMessage) return null;

  return (
    <div className="statusbar">
      <div className="statusbar__left">
        <span className="statusbar__count">
          {pluralize(itemCount, 'item')} loaded
        </span>
        {selectedCount > 0 && (
          <span className="statusbar__count">
            {pluralize(selectedCount, 'item')} selected
          </span>
        )}
      </div>

      <div className="statusbar__right">
        {isRunning && (
          <div className="statusbar__progress">
            <span className="statusbar__progress-text">
              {message}
              {currentFileName ? ` ${currentFileName}` : ''}
              {progress > 0 ? ` ${progress}%` : ''}
            </span>
            <ProgressBar progress={progress} />
            {canStop && (
              <button
                className="statusbar__stop-btn"
                onClick={onStop}
                title="Stop operation"
                aria-label="Stop"
              >
                <Square size={12} fill="currentColor" />
              </button>
            )}
          </div>
        )}

        {!isRunning && completionMessage && (
          <span className="statusbar__completion">{completionMessage}</span>
        )}
      </div>
    </div>
  );
};
