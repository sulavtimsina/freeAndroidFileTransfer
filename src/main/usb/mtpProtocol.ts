/**
 * MTP Protocol Abstraction Layer
 * Simulated implementation; swap with real libmtp backend when ready.
 */

export interface MtpFileInfo {
  id: number;
  name: string;
  size: number;
  type: 'file' | 'directory';
  modifiedAt: number;
  parentId: number;
}

export interface MtpSession {
  open(deviceId: string): Promise<void>;
  close(): Promise<void>;
  listDirectory(storageId: string, parentId: number): Promise<MtpFileInfo[]>;
  getFile(objectId: number, destPath: string): Promise<void>;
  sendFile(sourcePath: string, storageId: string, parentId: number, name: string): Promise<number>;
  deleteObject(objectId: number): Promise<void>;
  createDirectory(storageId: string, parentId: number, name: string): Promise<number>;
  isOpen(): boolean;
}

export class SimulatedMtpSession implements MtpSession {
  private _open = false;
  private nextId = 1000;

  private fakeFs: MtpFileInfo[] = [
    { id: 1, name: 'DCIM', size: 0, type: 'directory', modifiedAt: Date.now(), parentId: 0 },
    { id: 2, name: 'Download', size: 0, type: 'directory', modifiedAt: Date.now(), parentId: 0 },
    { id: 3, name: 'Music', size: 0, type: 'directory', modifiedAt: Date.now(), parentId: 0 },
    { id: 4, name: 'Pictures', size: 0, type: 'directory', modifiedAt: Date.now(), parentId: 0 },
    { id: 10, name: 'photo_001.jpg', size: 3_200_000, type: 'file', modifiedAt: Date.now() - 86400000, parentId: 1 },
    { id: 11, name: 'photo_002.jpg', size: 4_100_000, type: 'file', modifiedAt: Date.now() - 43200000, parentId: 1 },
    { id: 20, name: 'report.pdf', size: 1_500_000, type: 'file', modifiedAt: Date.now() - 172800000, parentId: 2 },
    { id: 30, name: 'song.mp3', size: 8_000_000, type: 'file', modifiedAt: Date.now() - 604800000, parentId: 3 },
  ];

  async open(_deviceId: string): Promise<void> { this._open = true; }
  async close(): Promise<void> { this._open = false; }
  isOpen(): boolean { return this._open; }

  async listDirectory(_storageId: string, parentId: number): Promise<MtpFileInfo[]> {
    this.ensureOpen();
    return this.fakeFs.filter((f) => f.parentId === parentId);
  }

  async getFile(_objectId: number, _destPath: string): Promise<void> { this.ensureOpen(); }

  async sendFile(_src: string, _sid: string, parentId: number, name: string): Promise<number> {
    this.ensureOpen();
    const id = this.nextId++;
    this.fakeFs.push({ id, name, size: 1024, type: 'file', modifiedAt: Date.now(), parentId });
    return id;
  }

  async deleteObject(objectId: number): Promise<void> {
    this.ensureOpen();
    this.fakeFs = this.fakeFs.filter((f) => f.id !== objectId);
  }

  async createDirectory(_sid: string, parentId: number, name: string): Promise<number> {
    this.ensureOpen();
    const id = this.nextId++;
    this.fakeFs.push({ id, name, size: 0, type: 'directory', modifiedAt: Date.now(), parentId });
    return id;
  }

  private ensureOpen(): void {
    if (!this._open) throw new Error('MTP session not open');
  }
}
