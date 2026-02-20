import React from 'react';
import { TransferItem } from '../../shared/types';

interface TransferModalProps {
  transfer: TransferItem | null;
  onCancel: (id: string) => void;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const TransferModal: React.FC<TransferModalProps> = ({ transfer, onCancel, onClose }) => {
  if (!transfer) return null;

  const isActive = transfer.status === 'in-progress' || transfer.status === 'queued';

  return (
    <div className="transfer-modal-overlay" onClick={onClose}>
      <div className="transfer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="transfer-modal-header">
          <h3>{transfer.direction === 'push' ? '⬆️ Uploading' : '⬇️ Downloading'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="transfer-modal-body">
          <p className="transfer-filename">{transfer.fileName}</p>
          <p className="transfer-path">
            {transfer.sourcePath} → {transfer.destinationPath}
          </p>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${transfer.progress}%` }}
            />
          </div>

          <div className="transfer-stats">
            <span>{formatBytes(transfer.transferredBytes)} / {formatBytes(transfer.totalBytes)}</span>
            <span>{transfer.progress}%</span>
          </div>

          <p className={`transfer-status status-${transfer.status}`}>
            {transfer.status.toUpperCase()}
          </p>
        </div>

        <div className="transfer-modal-footer">
          {isActive && (
            <button className="cancel-btn" onClick={() => onCancel(transfer.id)}>
              Cancel Transfer
            </button>
          )}
          {!isActive && (
            <button className="close-btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
