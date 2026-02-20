import React, { useState, useEffect, useRef } from 'react';

export interface NewFolderDialogProps {
  open: boolean;
  onCreateFolder: (name: string) => void;
  onCancel: () => void;
}

const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
  open,
  onCreateFolder,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onCreateFolder(trimmed);
    }
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">New Folder</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="dialog-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onCancel()}
            placeholder="Folder name"
          />
          <div className="dialog-actions">
            <button type="button" className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="dialog-btn dialog-btn-confirm" disabled={!name.trim()}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFolderDialog;
