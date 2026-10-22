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

export interface FileOperationResult {
  success: boolean;
  error?: string;
  path?: string;
}

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
    refresh: () => Promise<Device | null>;
  };
  fileOps: {
    createFolder: (parentPath: string, folderName: string) => Promise<FileOperationResult>;
    rename: (itemPath: string, newName: string) => Promise<FileOperationResult>;
    delete: (itemPath: string) => Promise<FileOperationResult>;
  };
  transfer: {
    upload: (localPaths: string[] | null, deviceDir: string) => Promise<TransferItem[]>;
    download: (devicePaths: string[]) => Promise<TransferItem[]>;
    cancel: (id: string) => Promise<void>;
    getQueue: () => Promise<TransferItem[]>;
    clearFinished: () => Promise<void>;
    reveal: (localPath: string) => Promise<void>;
    onProgress: (callback: (progress: TransferProgress, item: TransferItem) => void) => void;
    removeProgressListener: () => void;
  };
  getPathForFile: (file: File) => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
