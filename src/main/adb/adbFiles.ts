/**
 * Real file operations on the phone's shared storage over adb.
 * Paths the renderer sees are relative to the storage root ("/" = /sdcard).
 */
import { runAdb, adbShell, shQuote } from './adb';
import { FileEntry, FileType, SortField, SortDirection, getFileType } from '../files/fileService';
import { FileOperationResult } from '../files/fileOperations';

export const DEVICE_ROOT = '/sdcard';

export function toDevicePath(uiPath: string): string {
  const clean = ('/' + uiPath).replace(/\/+/g, '/').replace(/\/$/, '');
  return DEVICE_ROOT + clean;
}

function joinUi(parent: string, name: string): string {
  return parent === '/' ? `/${name}` : `${parent}/${name}`;
}

const INVALID_NAME = /[/\\\0]/;

/** Parse lines of `stat -c '%F|%s|%Y|%n'`; the name is last so it may contain "|". */
export function parseStatOutput(output: string, uiParent: string): FileEntry[] {
  const entries: FileEntry[] = [];
  for (const line of output.split('\n')) {
    const parts = line.replace(/\r$/, '').split('|');
    if (parts.length < 4) continue;
    const [kind, size, mtime] = parts;
    const fullName = parts.slice(3).join('|');
    const name = fullName.substring(fullName.lastIndexOf('/') + 1);
    if (!name) continue;
    const isDir = kind === 'directory';
    entries.push({
      name,
      path: joinUi(uiParent, name),
      type: isDir ? 'directory' : 'file',
      size: isDir ? 0 : Number(size) || 0,
      modifiedAt: (Number(mtime) || 0) * 1000,
      fileType: getFileType(name, isDir) as FileType,
    });
  }
  return entries;
}

export function sortEntries(entries: FileEntry[], sort?: { field: SortField; direction: SortDirection }): FileEntry[] {
  const field = sort?.field ?? 'name';
  const dir = sort?.direction === 'desc' ? -1 : 1;
  return [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    switch (field) {
      case 'size': return dir * (a.size - b.size);
      case 'modifiedAt': return dir * (a.modifiedAt - b.modifiedAt);
      case 'type': return dir * a.fileType.localeCompare(b.fileType);
      default: return dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }
  });
}

export async function listDirectory(
  serial: string,
  uiPath: string,
  sort?: { field: SortField; direction: SortDirection },
): Promise<FileEntry[]> {
  const dir = toDevicePath(uiPath) + '/';
  // Unreadable entries (e.g. Android/data) are skipped rather than failing the listing.
  const out = await runAdb([
    '-s', serial, 'shell',
    `find ${shQuote(dir)} -mindepth 1 -maxdepth 1 -exec stat -L -c '%F|%s|%Y|%n' {} + 2>/dev/null`,
  ]);
  return sortEntries(parseStatOutput(out, uiPath), sort);
}

export async function getDirectoryTree(serial: string): Promise<{ name: string; path: string; children: any[] }> {
  const top = await listDirectory(serial, '/');
  return {
    name: 'Internal Storage',
    path: '/',
    children: top
      .filter((e) => e.type === 'directory' && !e.name.startsWith('.'))
      .map((e) => ({ name: e.name, path: e.path, children: [] })),
  };
}

export async function getEntrySize(serial: string, uiPath: string): Promise<number> {
  const out = await runAdb(['-s', serial, 'shell', `du -sk ${shQuote(toDevicePath(uiPath))} 2>/dev/null`]);
  return (parseInt(out.trim().split(/\s+/)[0], 10) || 0) * 1024;
}

export async function getFileSize(serial: string, uiPath: string): Promise<number> {
  const out = await runAdb(['-s', serial, 'shell', `stat -L -c '%F|%s' ${shQuote(toDevicePath(uiPath))}`]);
  const [kind, size] = out.trim().split('|');
  return kind === 'directory' ? getEntrySize(serial, uiPath) : Number(size) || 0;
}

export async function createFolder(serial: string, parentPath: string, folderName: string): Promise<FileOperationResult> {
  const name = folderName.trim();
  if (!name) return { success: false, error: 'Folder name cannot be empty' };
  if (INVALID_NAME.test(name)) return { success: false, error: 'Folder name contains invalid characters' };
  const uiPath = joinUi(parentPath, name);
  try {
    await adbShell(serial, `mkdir ${shQuote(toDevicePath(uiPath))}`);
    return { success: true, path: uiPath };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function renameItem(serial: string, itemPath: string, newName: string): Promise<FileOperationResult> {
  const name = newName.trim();
  if (!name) return { success: false, error: 'Name cannot be empty' };
  if (INVALID_NAME.test(name)) return { success: false, error: 'Name contains invalid characters' };
  const parent = itemPath.substring(0, itemPath.lastIndexOf('/')) || '/';
  const uiPath = joinUi(parent, name);
  try {
    // -n: never overwrite an existing item with the same name.
    await adbShell(serial, `[ ! -e ${shQuote(toDevicePath(uiPath))} ] || { echo 'An item with that name already exists'; exit 1; }; mv -n ${shQuote(toDevicePath(itemPath))} ${shQuote(toDevicePath(uiPath))}`);
    return { success: true, path: uiPath };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteItem(serial: string, itemPath: string): Promise<FileOperationResult> {
  if (!itemPath || toDevicePath(itemPath) === DEVICE_ROOT) {
    return { success: false, error: 'Cannot delete root directory' };
  }
  try {
    await adbShell(serial, `rm -rf ${shQuote(toDevicePath(itemPath))}`, 120000);
    return { success: true, path: itemPath };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
