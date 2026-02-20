import React, { useState, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { Toolbar, ViewMode, SortField } from './Toolbar';

// Types matching fileService
interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: number;
  fileType: string;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
}

const FILE_ICONS: Record<string, string> = {
  folder: '📁', image: '🖼️', video: '🎬', audio: '🎵',
  document: '📄', archive: '📦', generic: '📎',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface FileBrowserProps {
  files: FileEntry[];
  tree: TreeNode | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onNewFolder: () => void;
  onDelete: (paths: string[]) => void;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  files, tree, currentPath, onNavigate, onNewFolder, onDelete,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const handleClick = (entry: FileEntry, e: React.MouseEvent) => {
    if (entry.type === 'directory') {
      onNavigate(entry.path);
      setSelected(new Set());
    } else {
      if (e.metaKey || e.ctrlKey) {
        const next = new Set(selected);
        next.has(entry.path) ? next.delete(entry.path) : next.add(entry.path);
        setSelected(next);
      } else {
        setSelected(new Set([entry.path]));
      }
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar tree={tree} currentPath={currentPath} onNavigate={(p) => { onNavigate(p); setSelected(new Set()); }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Breadcrumb path={currentPath} onNavigate={(p) => { onNavigate(p); setSelected(new Set()); }} />
        <Toolbar
          viewMode={viewMode} sortField={sortField} searchQuery={searchQuery}
          onViewModeChange={setViewMode} onSortChange={setSortField}
          onSearchChange={setSearchQuery} onNewFolder={onNewFolder}
          onDelete={() => onDelete(Array.from(selected))} hasSelection={selected.size > 0}
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: viewMode === 'grid' ? 16 : 0 }}>
          {filteredFiles.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
              {searchQuery ? 'No matching files' : 'Empty folder'}
            </div>
          ) : viewMode === 'list' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                  <th style={{ textAlign: 'left', padding: '8px 16px', fontWeight: 600, color: '#666' }}>Name</th>
                  <th style={{ textAlign: 'right', padding: '8px 16px', fontWeight: 600, color: '#666', width: 100 }}>Size</th>
                  <th style={{ textAlign: 'right', padding: '8px 16px', fontWeight: 600, color: '#666', width: 140 }}>Modified</th>
                  <th style={{ textAlign: 'left', padding: '8px 16px', fontWeight: 600, color: '#666', width: 80 }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((f) => (
                  <tr
                    key={f.path}
                    onClick={(e) => handleClick(f, e)}
                    style={{
                      cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                      background: selected.has(f.path) ? '#007aff15' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '6px 16px' }}>
                      <span style={{ marginRight: 8 }}>{FILE_ICONS[f.fileType] ?? '📎'}</span>
                      {f.name}
                    </td>
                    <td style={{ padding: '6px 16px', textAlign: 'right', color: '#888' }}>
                      {f.type === 'directory' ? `${f.size} items` : formatBytes(f.size)}
                    </td>
                    <td style={{ padding: '6px 16px', textAlign: 'right', color: '#888' }}>{formatDate(f.modifiedAt)}</td>
                    <td style={{ padding: '6px 16px', color: '#888' }}>{f.fileType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {filteredFiles.map((f) => (
                <div
                  key={f.path}
                  onClick={(e) => handleClick(f, e)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: 12, borderRadius: 8, cursor: 'pointer',
                    background: selected.has(f.path) ? '#007aff15' : '#f8f8f8',
                    border: selected.has(f.path) ? '1px solid #007aff40' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 32 }}>{FILE_ICONS[f.fileType] ?? '📎'}</span>
                  <span style={{
                    fontSize: 12, marginTop: 6, textAlign: 'center', wordBreak: 'break-all',
                    overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
