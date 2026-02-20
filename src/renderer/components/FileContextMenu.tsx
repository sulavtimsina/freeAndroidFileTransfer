import React, { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  destructive?: boolean;
  separator?: boolean;
}

export interface FileContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({ open, x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div ref={ref} className="context-menu" style={{ position: 'fixed', top: y, left: x }}>
      {items.map((item, i) => item.separator
        ? <div key={i} className="context-menu-separator" />
        : <button key={i} className={`context-menu-item ${item.destructive ? 'context-menu-item-destructive' : ''}`}
            onClick={() => { item.action(); onClose(); }}>
            {item.icon && <span className="context-menu-icon">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
      )}
    </div>
  );
};

export default FileContextMenu;
