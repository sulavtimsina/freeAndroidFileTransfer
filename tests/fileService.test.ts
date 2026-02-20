import { describe, it, expect } from 'vitest';
import { listDirectory, getDirectoryTree } from '../src/main/files/fileService';

describe('fileService', () => {
  it('lists root directory', () => {
    const entries = listDirectory('/');
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e) => e.name === 'DCIM')).toBe(true);
    expect(entries.some((e) => e.name === 'Download')).toBe(true);
  });

  it('lists nested directory', () => {
    const entries = listDirectory('/DCIM/Camera');
    expect(entries.length).toBe(3);
    expect(entries.some((e) => e.name === 'IMG_20240101.jpg')).toBe(true);
  });

  it('returns empty for nonexistent path', () => {
    expect(listDirectory('/nonexistent')).toEqual([]);
  });

  it('sorts by name ascending', () => {
    const entries = listDirectory('/', { field: 'name', direction: 'asc' });
    const names = entries.map((e) => e.name);
    const dirNames = names.filter((_, i) => entries[i].type === 'directory');
    expect(dirNames).toEqual([...dirNames].sort());
  });

  it('assigns correct file types', () => {
    const entries = listDirectory('/DCIM/Camera');
    const jpg = entries.find((e) => e.name.endsWith('.jpg'));
    expect(jpg?.fileType).toBe('image');
    const mp4 = entries.find((e) => e.name.endsWith('.mp4'));
    expect(mp4?.fileType).toBe('video');
  });

  it('builds directory tree', () => {
    const tree = getDirectoryTree('/');
    expect(tree).not.toBeNull();
    expect(tree!.name).toBe('Device');
    expect(tree!.children.length).toBeGreaterThan(0);
    const dcim = tree!.children.find((c: any) => c.name === 'DCIM');
    expect(dcim).toBeDefined();
    expect(dcim.children.some((c: any) => c.name === 'Camera')).toBe(true);
  });

  it('directory size shows item count', () => {
    const entries = listDirectory('/');
    const dcim = entries.find((e) => e.name === 'DCIM');
    expect(dcim?.type).toBe('directory');
    expect(dcim?.size).toBe(1); // 1 child (Camera)
  });
});
