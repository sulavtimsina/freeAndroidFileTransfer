import React from 'react';
import { useDragDrop } from '../hooks/useDragDrop';

export interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  enabled?: boolean;
  children: React.ReactNode;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, enabled = true, children }) => {
  const {
    isDragging,
    isDropping,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  } = useDragDrop({ onFilesDropped, enabled });

  return (
    <div
      className={`drop-zone ${isDragging ? 'drop-zone--dragging' : ''} ${isDropping ? 'drop-zone--dropping' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {isDragging && (
        <div className="drop-zone__overlay">
          <div className="drop-zone__overlay-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Drop files to transfer to device</p>
          </div>
        </div>
      )}

      {isDropping && (
        <div className="drop-zone__overlay drop-zone__overlay--success">
          <div className="drop-zone__overlay-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p>Transferring files...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
