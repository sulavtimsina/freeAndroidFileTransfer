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
    refresh: () => ipcRenderer.invoke('device:refresh'),
  },
  files: {
    listDirectory: (path: string, sort?: any) => ipcRenderer.invoke('files:listDirectory', path, sort),
    getDirectoryTree: (basePath?: string) => ipcRenderer.invoke('files:getDirectoryTree', basePath),
  },
  fileOps: {
    createFolder: (parentPath: string, folderName: string) =>
      ipcRenderer.invoke('file:createFolder', parentPath, folderName),
    rename: (itemPath: string, newName: string) =>
      ipcRenderer.invoke('file:rename', itemPath, newName),
    delete: (itemPath: string) => ipcRenderer.invoke('file:delete', itemPath),
  },
  transfer: {
    upload: (localPaths: string[] | null, deviceDir: string) =>
      ipcRenderer.invoke('transfer:upload', localPaths, deviceDir),
    download: (devicePaths: string[]) => ipcRenderer.invoke('transfer:download', devicePaths),
    cancel: (id: string) => ipcRenderer.invoke('transfer:cancel', id),
    getQueue: () => ipcRenderer.invoke('transfer:getQueue'),
    clearFinished: () => ipcRenderer.invoke('transfer:clearFinished'),
    reveal: (localPath: string) => ipcRenderer.invoke('transfer:reveal', localPath),
    onProgress: (callback: (progress: any, item: any) => void) => {
      ipcRenderer.on('transfer:progress', (_e, progress, item) => callback(progress, item));
    },
    removeProgressListener: () => {
      ipcRenderer.removeAllListeners('transfer:progress');
    },
  },
  // Electron <32 exposes the absolute path of dropped files on File.path.
  getPathForFile: (file: File) => (file as File & { path?: string }).path ?? '',
});
