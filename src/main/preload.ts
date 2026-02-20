import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  device: {
    onDeviceEvent: (callback: (event: any) => void) => {
      ipcRenderer.on('device:event', (_e, event) => callback(event));
    },
    removeDeviceListener: () => {
      ipcRenderer.removeAllListeners('device:event');
    },
    getConnectedDevice: () => ipcRenderer.invoke('device:getConnected'),
    simulateConnect: () => ipcRenderer.invoke('device:simulateConnect'),
    simulateDisconnect: () => ipcRenderer.invoke('device:simulateDisconnect'),
  },
  files: {
    listDirectory: (path: string, sort?: any) => ipcRenderer.invoke('files:listDirectory', path, sort),
    getDirectoryTree: (basePath?: string) => ipcRenderer.invoke('files:getDirectoryTree', basePath),
  },
});
