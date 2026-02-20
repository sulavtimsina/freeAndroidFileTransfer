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

// Electron API

export interface ElectronAPI {
  platform: string;
  device: {
    onDeviceEvent: (callback: (event: DeviceEvent) => void) => void;
    removeDeviceListener: () => void;
    getConnectedDevice: () => Promise<Device | null>;
    simulateConnect: () => Promise<Device>;
    simulateDisconnect: () => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
