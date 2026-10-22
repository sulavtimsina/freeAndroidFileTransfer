import React from 'react';

export type ViewMode = 'list' | 'grid';
export type SortField = 'name' | 'size' | 'modifiedAt' | 'type';

interface ToolbarProps {
  viewMode: ViewMode;
  sortField: SortField;
  searchQuery: string;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (field: SortField) => void;
  onSearchChange: (query: string) => void;
  onNewFolder: () => void;
  onDelete: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onRename: () => void;
  onRefresh: () => void;
  hasSelection: boolean;
  singleSelection: boolean;
}

const btn: React.CSSProperties = {
  flexShrink: 0, whiteSpace: 'nowrap',
  padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13,
};
const disabledBtn: React.CSSProperties = { ...btn, background: '#f5f5f5', color: '#bbb', cursor: 'default' };

export const Toolbar: React.FC<ToolbarProps> = ({
  viewMode, sortField, searchQuery,
  onViewModeChange, onSortChange, onSearchChange, onNewFolder, onDelete,
  onUpload, onDownload, onRename, onRefresh, hasSelection, singleSelection,
}) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', flexWrap: 'wrap',
      borderBottom: '1px solid #e8e8e8', background: '#fafafa',
    }}>
      {/* View toggle */}
      <div style={{ display: 'flex', flexShrink: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid #ddd' }}>
        <button
          onClick={() => onViewModeChange('list')}
          style={{
            padding: '4px 10px', border: 'none', cursor: 'pointer', fontSize: 13,
            background: viewMode === 'list' ? '#007aff' : '#fff',
            color: viewMode === 'list' ? '#fff' : '#333',
          }}
        >☰</button>
        <button
          onClick={() => onViewModeChange('grid')}
          style={{
            padding: '4px 10px', border: 'none', cursor: 'pointer', fontSize: 13,
            background: viewMode === 'grid' ? '#007aff' : '#fff',
            color: viewMode === 'grid' ? '#fff' : '#333',
          }}
        >⊞</button>
      </div>

      {/* Sort */}
      <select
        value={sortField}
        onChange={(e) => onSortChange(e.target.value as SortField)}
        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
      >
        <option value="name">Name</option>
        <option value="size">Size</option>
        <option value="modifiedAt">Date</option>
        <option value="type">Type</option>
      </select>

      {/* Search */}
      <input
        type="text"
        placeholder="Search…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          padding: '4px 10px', borderRadius: 6, border: '1px solid #ddd',
          fontSize: 13, flex: 1, minWidth: 120, maxWidth: 220,
        }}
      />


      {/* Actions */}
      <button onClick={onRefresh} style={btn} title="Refresh">⟳</button>
      <button onClick={onUpload} style={{ ...btn, background: '#007aff', color: '#fff', borderColor: '#007aff' }}>⬆ Upload</button>
      <button onClick={onDownload} disabled={!hasSelection} style={hasSelection ? btn : disabledBtn}>⬇ Download</button>
      <button onClick={onRename} disabled={!singleSelection} style={singleSelection ? btn : disabledBtn}>✎ Rename</button>
      <button onClick={onNewFolder} style={btn}>📁 New Folder</button>
      <button
        onClick={onDelete}
        disabled={!hasSelection}
        style={{
          ...btn,
          background: hasSelection ? '#fee' : '#f5f5f5',
          color: hasSelection ? '#e53935' : '#bbb',
        }}
      >🗑 Delete</button>
    </div>
  );
};
