// Device & Connection Types

export interface Device {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  storage: StorageInfo[];
  connectionStatus: ConnectionStatus;
}

export interface StorageInfo {
  id: string;
  label: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  type: 'internal' | 'sdcard';
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DeviceEvent {
  type: 'connected' | 'disconnected' | 'error';
  device?: Device;
  error?: string;
}

// Transfer Types

export type TransferDirection = 'push' | 'pull';
export type TransferStatus = 'queued' | 'in-progress' | 'completed' | 'cancelled' | 'error';

export interface TransferItem {
  id: string;
  fileName: string;
  sourcePath: string;
  destinationPath: string;
  direction: TransferDirection;
  totalBytes: number;
  transferredBytes: number;
  status: TransferStatus;
  progress: number; // 0-100
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface TransferProgress {
  id: string;
  transferredBytes: number;
  totalBytes: number;
  progress: number;
  status: TransferStatus;
}

export interface TransferRequest {
  sourcePath: string;
  destinationPath: string;
  direction: TransferDirection;
  fileName: string;
  totalBytes: number;
}

// Electron API

export interface ElectronAPI {
  platform: string;
  files: {
    listDirectory: (path: string, sort?: { field: string; direction: string }) => Promise<any[]>;
    getDirectoryTree: (basePath?: string) => Promise<any>;
  };
  device: {
    onDeviceEvent: (callback: (event: DeviceEvent) => void) => void;
    removeDeviceListener: () => void;
    getConnectedDevice: () => Promise<Device | null>;
    simulateConnect: () => Promise<Device>;
    simulateDisconnect: () => Promise<void>;
  };
  transfer: {
    start: (request: TransferRequest) => Promise<TransferItem>;
    cancel: (id: string) => Promise<void>;
    getQueue: () => Promise<TransferItem[]>;
    onProgress: (callback: (progress: TransferProgress) => void) => void;
    removeProgressListener: () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
