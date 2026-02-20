import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { getDeviceManager } from './usb/deviceManager';
import { listDirectory, getDirectoryTree } from './files/fileService';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

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
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show();
  });

  const dm = getDeviceManager();
  dm.on('device-event', (event) => {
    mainWindow?.webContents.send('device:event', event);
  });
}

function registerIpcHandlers(): void {
  const dm = getDeviceManager();
  ipcMain.handle('device:getConnected', () => dm.getConnectedDevice());
  ipcMain.handle('device:simulateConnect', () => dm.simulateConnect());
  ipcMain.handle('device:simulateDisconnect', () => dm.simulateDisconnect());

  ipcMain.handle('files:listDirectory', (_e, path: string, sort?: any) => listDirectory(path, sort));
  ipcMain.handle('files:getDirectoryTree', (_e, basePath?: string) => getDirectoryTree(basePath));
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
