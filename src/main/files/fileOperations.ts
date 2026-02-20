/**
 * File operations for Android device management (simulated).
 * In production, these would communicate with the device via MTP/ADB.
 */

export interface FileOperationResult {
  success: boolean;
  error?: string;
  path?: string;
}

export async function createFolder(
  parentPath: string,
  folderName: string
): Promise<FileOperationResult> {
  if (!folderName || folderName.trim().length === 0) {
    return { success: false, error: 'Folder name cannot be empty' };
  }
  if (/[<>:"/\\|?*]/.test(folderName)) {
    return { success: false, error: 'Folder name contains invalid characters' };
  }
  const newPath = `${parentPath}/${folderName}`.replace(/\/+/g, '/');
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log(`[FileOps] Created folder: ${newPath}`);
  return { success: true, path: newPath };
}

export async function renameItem(
  itemPath: string,
  newName: string
): Promise<FileOperationResult> {
  if (!newName || newName.trim().length === 0) {
    return { success: false, error: 'Name cannot be empty' };
  }
  if (/[<>:"/\\|?*]/.test(newName)) {
    return { success: false, error: 'Name contains invalid characters' };
  }
  const parentPath = itemPath.substring(0, itemPath.lastIndexOf('/'));
  const newPath = `${parentPath}/${newName}`.replace(/\/+/g, '/');
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log(`[FileOps] Renamed: ${itemPath} -> ${newPath}`);
  return { success: true, path: newPath };
}

export async function deleteItem(
  itemPath: string
): Promise<FileOperationResult> {
  if (!itemPath || itemPath === '/') {
    return { success: false, error: 'Cannot delete root directory' };
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`[FileOps] Deleted: ${itemPath}`);
  return { success: true, path: itemPath };
}
