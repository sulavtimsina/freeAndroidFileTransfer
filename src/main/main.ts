import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { getDeviceManager } from './usb/deviceManager';
import * as adbFiles from './adb/adbFiles';
import { AdbTransferService } from './adb/adbTransfer';

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
let mainWindow: BrowserWindow | null = null;

const transfers = new AdbTransferService((progress, item) => {
  mainWindow?.webContents.send('transfer:progress', progress, item);
  if (item.status === 'completed' && item.direction === 'push') void getDeviceManager().refresh().catch(() => undefined);
});

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Compiled layout: dist/main/main/main.js -> dist/renderer/index.html
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show();
  });
}

/** Every file call needs the serial of the phone that is currently connected. */
function serial(): string {
  const dev = getDeviceManager().getConnectedDevice();
  if (!dev) throw new Error('No device connected');
  return dev.id;
}

function registerIpcHandlers(): void {
  const dm = getDeviceManager();
  dm.on('device-event', (event) => {
    mainWindow?.webContents.send('device:event', event);
  });
  ipcMain.handle('device:getConnected', () => dm.getConnectedDevice());
  ipcMain.handle('device:refresh', () => dm.refresh());

  ipcMain.handle('files:listDirectory', (_e, dirPath: string, sort?: any) =>
    adbFiles.listDirectory(serial(), dirPath, sort));
  ipcMain.handle('files:getDirectoryTree', () => adbFiles.getDirectoryTree(serial()));
}

function registerFileOpsHandlers(): void {
  ipcMain.handle('file:createFolder', (_e, parentPath: string, folderName: string) =>
    adbFiles.createFolder(serial(), parentPath, folderName));
  ipcMain.handle('file:rename', (_e, itemPath: string, newName: string) =>
    adbFiles.renameItem(serial(), itemPath, newName));
  ipcMain.handle('file:delete', (_e, itemPath: string) => adbFiles.deleteItem(serial(), itemPath));
}

function registerTransferHandlers(): void {
  ipcMain.handle('transfer:upload', async (_e, localPaths: string[] | null, deviceDir: string) => {
    let paths = localPaths;
    if (!paths || paths.length === 0) {
      const res = await dialog.showOpenDialog(mainWindow!, {
        title: 'Choose files to copy to the phone',
        properties: ['openFile', 'openDirectory', 'multiSelections'],
      });
      if (res.canceled) return [];
      paths = res.filePaths;
    }
    const s = serial();
    return Promise.all(paths.map((p) =>
      transfers.enqueue({ serial: s, direction: 'push', sourcePath: p, destinationDir: deviceDir })));
  });

  ipcMain.handle('transfer:download', async (_e, devicePaths: string[]) => {
    const res = await dialog.showOpenDialog(mainWindow!, {
      title: 'Choose where to save on your Mac',
      defaultPath: app.getPath('downloads'),
      properties: ['openDirectory', 'createDirectory'],
    });
    if (res.canceled || !res.filePaths[0]) return [];
    const s = serial();
    return Promise.all(devicePaths.map((p) =>
      transfers.enqueue({ serial: s, direction: 'pull', sourcePath: p, destinationDir: res.filePaths[0] })));
  });

  ipcMain.handle('transfer:cancel', (_e, id: string) => transfers.cancel(id));
  ipcMain.handle('transfer:getQueue', () => transfers.getQueue());
  ipcMain.handle('transfer:clearFinished', () => transfers.clearFinished());
  ipcMain.handle('transfer:reveal', (_e, localPath: string) => shell.showItemInFolder(localPath));
}

app.whenReady().then(() => {
  registerIpcHandlers();
  registerFileOpsHandlers();
  registerTransferHandlers();
  createWindow();
  getDeviceManager().startPolling();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  getDeviceManager().stopPolling();
});
