import { describe, it, expect } from 'vitest';
import { createFolder, renameItem, deleteItem } from '../src/main/files/fileOperations';

describe('File Operations', () => {
  describe('createFolder', () => {
    it('should create a folder successfully', async () => {
      const result = await createFolder('/DCIM', 'NewFolder');
      expect(result.success).toBe(true);
      expect(result.path).toBe('/DCIM/NewFolder');
    });

    it('should reject empty folder name', async () => {
      const result = await createFolder('/DCIM', '');
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject invalid characters', async () => {
      const result = await createFolder('/DCIM', 'bad:name');
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid characters');
    });
  });

  describe('renameItem', () => {
    it('should rename successfully', async () => {
      const result = await renameItem('/DCIM/photo.jpg', 'vacation.jpg');
      expect(result.success).toBe(true);
      expect(result.path).toBe('/DCIM/vacation.jpg');
    });

    it('should reject empty name', async () => {
      const result = await renameItem('/DCIM/photo.jpg', '');
      expect(result.success).toBe(false);
    });

    it('should reject invalid characters', async () => {
      const result = await renameItem('/DCIM/photo.jpg', 'bad|name.jpg');
      expect(result.success).toBe(false);
    });
  });

  describe('deleteItem', () => {
    it('should delete successfully', async () => {
      const result = await deleteItem('/DCIM/photo.jpg');
      expect(result.success).toBe(true);
    });

    it('should not delete root', async () => {
      const result = await deleteItem('/');
      expect(result.success).toBe(false);
      expect(result.error).toContain('root');
    });

    it('should reject empty path', async () => {
      const result = await deleteItem('');
      expect(result.success).toBe(false);
    });
  });
});
