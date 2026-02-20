/**
 * File Service — simulated filesystem for development.
 * Replace with real MTP file operations when device layer is ready.
 */

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: number;
  fileType: FileType;
}

export type FileType = 'folder' | 'image' | 'video' | 'audio' | 'document' | 'archive' | 'generic';

export type SortField = 'name' | 'size' | 'modifiedAt' | 'type';
export type SortDirection = 'asc' | 'desc';

const EXT_MAP: Record<string, FileType> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', bmp: 'image',
  mp4: 'video', mkv: 'video', avi: 'video', mov: 'video', webm: 'video',
  mp3: 'audio', flac: 'audio', wav: 'audio', aac: 'audio', ogg: 'audio',
  pdf: 'document', doc: 'document', docx: 'document', txt: 'document', xls: 'document', xlsx: 'document',
  zip: 'archive', tar: 'archive', gz: 'archive', rar: 'archive', '7z': 'archive',
};

function getFileType(name: string, isDir: boolean): FileType {
  if (isDir) return 'folder';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MAP[ext] ?? 'generic';
}

interface SimNode {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: number;
  children?: SimNode[];
}

const SIMULATED_FS: SimNode = {
  name: '/', type: 'directory', size: 0, modifiedAt: Date.now(),
  children: [
    {
      name: 'DCIM', type: 'directory', size: 0, modifiedAt: Date.now() - 86400000,
      children: [
        {
          name: 'Camera', type: 'directory', size: 0, modifiedAt: Date.now() - 86400000,
          children: [
            { name: 'IMG_20240101.jpg', type: 'file', size: 3_200_000, modifiedAt: Date.now() - 2592000000 },
            { name: 'IMG_20240215.jpg', type: 'file', size: 4_100_000, modifiedAt: Date.now() - 1296000000 },
            { name: 'VID_20240301.mp4', type: 'file', size: 52_000_000, modifiedAt: Date.now() - 864000000 },
          ],
        },
      ],
    },
    {
      name: 'Download', type: 'directory', size: 0, modifiedAt: Date.now() - 43200000,
      children: [
        { name: 'report-q4.pdf', type: 'file', size: 1_500_000, modifiedAt: Date.now() - 172800000 },
        { name: 'budget.xlsx', type: 'file', size: 350_000, modifiedAt: Date.now() - 604800000 },
        { name: 'archive.zip', type: 'file', size: 25_000_000, modifiedAt: Date.now() - 259200000 },
      ],
    },
    {
      name: 'Music', type: 'directory', size: 0, modifiedAt: Date.now() - 604800000,
      children: [
        { name: 'song1.mp3', type: 'file', size: 8_000_000, modifiedAt: Date.now() - 604800000 },
        { name: 'song2.flac', type: 'file', size: 35_000_000, modifiedAt: Date.now() - 432000000 },
      ],
    },
    {
      name: 'Pictures', type: 'directory', size: 0, modifiedAt: Date.now() - 172800000,
      children: [
        { name: 'wallpaper.png', type: 'file', size: 2_800_000, modifiedAt: Date.now() - 172800000 },
        { name: 'screenshot.png', type: 'file', size: 450_000, modifiedAt: Date.now() - 86400000 },
      ],
    },
    {
      name: 'Documents', type: 'directory', size: 0, modifiedAt: Date.now() - 86400000,
      children: [
        { name: 'notes.txt', type: 'file', size: 1_200, modifiedAt: Date.now() - 86400000 },
        { name: 'resume.docx', type: 'file', size: 95_000, modifiedAt: Date.now() - 2592000000 },
      ],
    },
    { name: 'Android', type: 'directory', size: 0, modifiedAt: Date.now() - 2592000000, children: [] },
  ],
};

function findNode(path: string): SimNode | null {
  if (path === '/') return SIMULATED_FS;
  const parts = path.split('/').filter(Boolean);
  let node = SIMULATED_FS;
  for (const part of parts) {
    const child = node.children?.find((c) => c.name === part);
    if (!child) return null;
    node = child;
  }
  return node;
}

export function listDirectory(dirPath: string, sort?: { field: SortField; direction: SortDirection }): FileEntry[] {
  const node = findNode(dirPath);
  if (!node || node.type !== 'directory') return [];

  let entries: FileEntry[] = (node.children ?? []).map((c) => ({
    name: c.name,
    path: dirPath === '/' ? `/${c.name}` : `${dirPath}/${c.name}`,
    type: c.type,
    size: c.type === 'directory' ? (c.children?.length ?? 0) : c.size,
    modifiedAt: c.modifiedAt,
    fileType: getFileType(c.name, c.type === 'directory'),
  }));

  if (sort) {
    const dir = sort.direction === 'asc' ? 1 : -1;
    entries.sort((a, b) => {
      // Directories always first
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      switch (sort.field) {
        case 'name': return dir * a.name.localeCompare(b.name);
        case 'size': return dir * (a.size - b.size);
        case 'modifiedAt': return dir * (a.modifiedAt - b.modifiedAt);
        case 'type': return dir * a.fileType.localeCompare(b.fileType);
        default: return 0;
      }
    });
  }

  return entries;
}

export function getDirectoryTree(basePath = '/'): { name: string; path: string; children: any[] } | null {
  const node = findNode(basePath);
  if (!node || node.type !== 'directory') return null;

  return {
    name: node.name === '/' ? 'Device' : node.name,
    path: basePath,
    children: (node.children ?? [])
      .filter((c) => c.type === 'directory')
      .map((c) => getDirectoryTree(basePath === '/' ? `/${c.name}` : `${basePath}/${c.name}`))
      .filter(Boolean),
  };
}
