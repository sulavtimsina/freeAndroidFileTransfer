import React from 'react';
import { TransferItem } from '../../shared/types';

interface TransferQueueProps {
  transfers: TransferItem[];
  onCancel: (id: string) => void;
  onSelect: (transfer: TransferItem) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const statusIcon: Record<string, string> = {
  'queued': '⏳',
  'in-progress': '🔄',
  'completed': '✅',
  'cancelled': '❌',
  'error': '⚠️',
};

export const TransferQueue: React.FC<TransferQueueProps> = ({ transfers, onCancel, onSelect }) => {
  if (transfers.length === 0) {
    return (
      <div className="transfer-queue empty">
        <p>No transfers in queue</p>
      </div>
    );
  }

  return (
    <div className="transfer-queue">
      <h3>Transfer Queue ({transfers.length})</h3>
      <ul className="transfer-list">
        {transfers.map((t) => (
          <li key={t.id} className={`transfer-item status-${t.status}`} onClick={() => onSelect(t)}>
            <div className="transfer-item-header">
              <span className="transfer-icon">
                {statusIcon[t.status] || '?'} {t.direction === 'push' ? '⬆️' : '⬇️'}
              </span>
              <span className="transfer-name">{t.fileName}</span>
            </div>

            {(t.status === 'in-progress' || t.status === 'queued') && (
              <div className="transfer-item-progress">
                <div className="mini-progress-bar">
                  <div className="mini-progress-fill" style={{ width: `${t.progress}%` }} />
                </div>
                <span className="transfer-percent">{t.progress}%</span>
              </div>
            )}

            <div className="transfer-item-details">
              <span>{formatBytes(t.transferredBytes)} / {formatBytes(t.totalBytes)}</span>
              {(t.status === 'in-progress' || t.status === 'queued') && (
                <button
                  className="cancel-btn-small"
                  onClick={(e) => { e.stopPropagation(); onCancel(t.id); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
