import React, { useState, useEffect, useRef } from 'react';

export interface RenameDialogProps {
  open: boolean;
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

const RenameDialog: React.FC<RenameDialogProps> = ({ open, currentName, onRename, onCancel }) => {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const dot = currentName.lastIndexOf('.');
          inputRef.current.setSelectionRange(0, dot > 0 ? dot : currentName.length);
        }
      }, 50);
    }
  }, [open, currentName]);

  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">Rename</h3>
        <form onSubmit={(e) => { e.preventDefault(); const t = name.trim(); if (t && t !== currentName) onRename(t); }}>
          <input ref={inputRef} type="text" className="dialog-input" value={name}
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && onCancel()} placeholder="Enter new name" />
          <div className="dialog-actions">
            <button type="button" className="dialog-btn dialog-btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="dialog-btn dialog-btn-confirm" disabled={!name.trim() || name.trim() === currentName}>Rename</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameDialog;
