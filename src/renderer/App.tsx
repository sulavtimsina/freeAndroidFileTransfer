import React, { useState, useEffect, useCallback } from 'react';
import './styles/App.css';
import { DevicePanel } from './components/DevicePanel';
import { FileBrowser, FileEntry } from './components/FileBrowser';
import { SortField } from './components/Toolbar';
import { TransferQueue } from './components/TransferQueue';
import DropZone from './components/DropZone';
import NewFolderDialog from './components/NewFolderDialog';
import RenameDialog from './components/RenameDialog';
import ConfirmDialog from './components/ConfirmDialog';
import FileContextMenu, { ContextMenuItem } from './components/FileContextMenu';
import { useDevice } from './hooks/useDevice';
import { TransferItem } from '../shared/types';

const api = window.electronAPI;

const App: React.FC = () => {
  const { device, status, error } = useDevice();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ entry: FileEntry; x: number; y: number } | null>(null);

  const deviceId = device?.id ?? null;

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    try {
      setFiles(await api.files.listDirectory(currentPath, { field: sortField, direction: 'asc' }));
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId, currentPath, sortField]);

  useEffect(() => {
    if (!deviceId) { setFiles([]); setTree(null); setCurrentPath('/'); return; }
    api.files.getDirectoryTree().then(setTree).catch(() => setTree(null));
  }, [deviceId]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    api.transfer.getQueue().then(setTransfers);
    api.transfer.onProgress((_p, item) => {
      setTransfers((prev) => {
        const i = prev.findIndex((t) => t.id === item.id);
        if (i === -1) return [...prev, item];
        const next = [...prev];
        next[i] = item;
        return next;
      });
      if (item.status === 'completed' && item.direction === 'push') void refreshRef.current();
      if (item.status === 'error') setMessage(`${item.fileName}: ${item.error}`);
    });
    return () => api.transfer.removeProgressListener();
  }, []);

  // The progress listener is registered once; keep it pointed at the latest refresh.
  const refreshRef = React.useRef(refresh);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  const runOp = async (op: Promise<{ success: boolean; error?: string }>) => {
    const res = await op;
    if (!res.success) setMessage(res.error ?? 'Operation failed');
    await refresh();
  };

  const upload = (paths: string[] | null) => { void api.transfer.upload(paths, currentPath); };
  const download = (paths: string[]) => { if (paths.length) void api.transfer.download(paths); };

  const menuItems = (entry: FileEntry): ContextMenuItem[] => [
    ...(entry.type === 'directory' ? [{ label: 'Open', icon: '📂', action: () => setCurrentPath(entry.path) }] : []),
    { label: 'Download to Mac…', icon: '⬇', action: () => download([entry.path]) },
    { label: 'Rename', icon: '✎', action: () => setRenameTarget(entry.path) },
    { label: '', action: () => undefined, separator: true },
    { label: 'Delete', icon: '🗑', destructive: true, action: () => setDeleteTargets([entry.path]) },
  ];

  return (
    <div className="app">
      <div className="titlebar">Android File Transfer</div>
      <div className="app-body">
        <aside className="left-pane">
          <DevicePanel device={device} status={status} error={error} />
          <TransferQueue
            transfers={[...transfers].reverse()}
            onCancel={(id) => api.transfer.cancel(id)}
            onSelect={(t) => { if (t.direction === 'pull' && t.status === 'completed') api.transfer.reveal(t.destinationPath); }}
          />
          {transfers.some((t) => t.status !== 'queued' && t.status !== 'in-progress') && (
            <button className="link-btn" onClick={async () => { await api.transfer.clearFinished(); setTransfers(await api.transfer.getQueue()); }}>
              Clear finished
            </button>
          )}
        </aside>
        <main className="main-pane">
          {device ? (
            <DropZone onFilesDropped={(fs) => upload(fs.map((f) => api.getPathForFile(f)).filter(Boolean))}>
              <FileBrowser
                files={files} tree={tree} currentPath={currentPath} loading={loading}
                sortField={sortField} onSortChange={setSortField}
                onNavigate={setCurrentPath}
                onNewFolder={() => setNewFolderOpen(true)}
                onDelete={setDeleteTargets}
                onUpload={() => upload(null)}
                onDownload={download}
                onRename={setRenameTarget}
                onRefresh={refresh}
                onContextMenu={(entry, x, y) => setMenu({ entry, x, y })}
              />
            </DropZone>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>📱</div>
              <h2>Connect an Android phone</h2>
              <p>Follow the steps on the left. The phone shows up here automatically.</p>
            </div>
          )}
        </main>
      </div>

      {message && (
        <div className="toast" onClick={() => setMessage(null)}>
          {message} <span className="toast-close">✕</span>
        </div>
      )}

      <FileContextMenu open={!!menu} x={menu?.x ?? 0} y={menu?.y ?? 0}
        items={menu ? menuItems(menu.entry) : []} onClose={() => setMenu(null)} />
      <NewFolderDialog open={newFolderOpen} onCancel={() => setNewFolderOpen(false)}
        onCreateFolder={(name) => { setNewFolderOpen(false); void runOp(api.fileOps.createFolder(currentPath, name)); }} />
      <RenameDialog open={!!renameTarget} currentName={renameTarget?.split('/').pop() ?? ''}
        onCancel={() => setRenameTarget(null)}
        onRename={(name) => { const t = renameTarget!; setRenameTarget(null); void runOp(api.fileOps.rename(t, name)); }} />
      <ConfirmDialog open={deleteTargets.length > 0} destructive confirmLabel="Delete"
        title={deleteTargets.length === 1 ? `Delete "${deleteTargets[0].split('/').pop()}"?` : `Delete ${deleteTargets.length} items?`}
        message="This permanently removes it from the phone. It cannot be undone."
        onCancel={() => setDeleteTargets([])}
        onConfirm={async () => {
          const targets = deleteTargets;
          setDeleteTargets([]);
          for (const t of targets) {
            const res = await api.fileOps.delete(t);
            if (!res.success) setMessage(res.error ?? 'Delete failed');
          }
          await refresh();
          void api.device.refresh();
        }} />
    </div>
  );
};

export default App;
