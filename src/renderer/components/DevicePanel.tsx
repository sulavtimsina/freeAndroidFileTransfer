import React from 'react';
import { Device, ConnectionStatus, StorageInfo } from '../../shared/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

const StorageBar: React.FC<{ storage: StorageInfo }> = ({ storage }) => {
  const usedPct = (storage.usedBytes / storage.totalBytes) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span>{storage.label}</span>
        <span style={{ color: '#888' }}>{formatBytes(storage.usedBytes)} / {formatBytes(storage.totalBytes)}</span>
      </div>
      <div style={{ height: 8, background: '#e0e0e0', borderRadius: 4, marginTop: 4 }}>
        <div style={{
          height: '100%',
          width: `${usedPct}%`,
          background: usedPct > 90 ? '#e53935' : usedPct > 70 ? '#fb8c00' : '#43a047',
          borderRadius: 4,
        }} />
      </div>
      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{formatBytes(storage.freeBytes)} free</div>
    </div>
  );
};

interface DevicePanelProps {
  device: Device | null;
  status: ConnectionStatus;
  error: string | null;
}

export const DevicePanel: React.FC<DevicePanelProps> = ({ device, status, error }) => {

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Device</h2>
        <span style={{
          padding: '2px 8px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 600,
          background: status === 'connected' ? '#e8f5e9' : status === 'connecting' ? '#fff3e0' : '#f5f5f5',
          color: status === 'connected' ? '#2e7d32' : status === 'connecting' ? '#ef6c00' : '#757575',
        }}>{status}</span>
      </div>

      {error && <div style={{ color: '#e53935', fontSize: 13, marginBottom: 8 }}>{error}</div>}

      {device ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>📱</span>
            <div>
              <strong>{device.name}</strong>
              <div style={{ fontSize: 12, color: '#888' }}>{device.manufacturer} · {device.model}</div>
            </div>
          </div>
          {device.storage.map((s) => <StorageBar key={s.id} storage={s} />)}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
          <p style={{ color: '#999', marginBottom: 8 }}>No phone found. To connect:</p>
          <ol style={{ paddingLeft: 18 }}>
            <li>On the phone open Settings → About phone and tap <b>Build number</b> 7 times.</li>
            <li>Go to Settings → System → Developer options and turn on <b>USB debugging</b>.</li>
            <li>Plug the phone into this Mac with a USB data cable.</li>
            <li>Unlock the phone and tap <b>Allow</b> on the "Allow USB debugging?" prompt.</li>
          </ol>
        </div>
      )}
    </div>
  );
};
