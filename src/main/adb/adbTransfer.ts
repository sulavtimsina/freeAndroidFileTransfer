/**
 * Transfer queue backed by `adb push` / `adb pull`.
 * Progress comes from polling the destination size while adb runs.
 */
import { ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { spawnAdb } from './adb';
import { toDevicePath, getEntrySize, getFileSize } from './adbFiles';
import { TransferItem, TransferProgress } from '../../shared/types';

export interface AdbTransferRequest {
  serial: string;
  direction: 'push' | 'pull';
  /** push: local absolute path; pull: device UI path ("/DCIM/x.jpg"). */
  sourcePath: string;
  /** push: device UI dir; pull: local absolute dir. */
  destinationDir: string;
}

let counter = 0;

function localSize(p: string): number {
  try {
    const st = fs.statSync(p);
    if (!st.isDirectory()) return st.size;
    return fs.readdirSync(p).reduce((sum, n) => sum + localSize(path.join(p, n)), 0);
  } catch {
    return 0;
  }
}

/** Avoid overwriting an existing local file: "a.jpg" -> "a (1).jpg". */
export function uniqueLocalPath(dir: string, name: string, exists = fs.existsSync): string {
  let candidate = path.join(dir, name);
  const ext = path.extname(name);
  const base = name.slice(0, name.length - ext.length);
  for (let i = 1; exists(candidate); i++) candidate = path.join(dir, `${base} (${i})${ext}`);
  return candidate;
}

export class AdbTransferService {
  private queue: (TransferItem & { req: AdbTransferRequest })[] = [];
  private active: { item: TransferItem; proc: ChildProcess; timer: ReturnType<typeof setInterval> } | null = null;

  constructor(private emit: (p: TransferProgress, item: TransferItem) => void) {}

  async enqueue(req: AdbTransferRequest): Promise<TransferItem> {
    const fileName = path.basename(req.sourcePath);
    const totalBytes = req.direction === 'push'
      ? localSize(req.sourcePath)
      : await getFileSize(req.serial, req.sourcePath).catch(() => 0);
    const item = {
      id: `transfer-${++counter}-${Date.now()}`,
      fileName,
      sourcePath: req.sourcePath,
      destinationPath: req.direction === 'push'
        ? (req.destinationDir === '/' ? `/${fileName}` : `${req.destinationDir}/${fileName}`)
        : uniqueLocalPath(req.destinationDir, fileName),
      direction: req.direction,
      totalBytes,
      transferredBytes: 0,
      status: 'queued' as const,
      progress: 0,
      req,
    };
    this.queue.push(item);
    this.publish(item);
    this.next();
    return this.strip(item);
  }

  cancel(id: string): void {
    const item = this.queue.find((t) => t.id === id);
    if (!item || (item.status !== 'queued' && item.status !== 'in-progress')) return;
    item.status = 'cancelled';
    item.completedAt = Date.now();
    if (this.active?.item.id === id) this.active.proc.kill();
    this.publish(item);
  }

  getQueue(): TransferItem[] {
    return this.queue.map((t) => this.strip(t));
  }

  clearFinished(): void {
    this.queue = this.queue.filter((t) => t.status === 'queued' || t.status === 'in-progress');
  }

  private next(): void {
    if (this.active) return;
    const item = this.queue.find((t) => t.status === 'queued');
    if (!item) return;
    const { req } = item;
    item.status = 'in-progress';
    item.startedAt = Date.now();

    const args = req.direction === 'push'
      ? ['-s', req.serial, 'push', req.sourcePath, toDevicePath(item.destinationPath)]
      : ['-s', req.serial, 'pull', '-a', toDevicePath(req.sourcePath), item.destinationPath];
    const proc = spawnAdb(args);
    let output = '';
    proc.stdout?.on('data', (d) => { output += d; });
    proc.stderr?.on('data', (d) => { output += d; });

    const timer = setInterval(async () => {
      const done = req.direction === 'pull'
        ? localSize(item.destinationPath)
        : await getEntrySize(req.serial, item.destinationPath).catch(() => item.transferredBytes);
      if (item.status !== 'in-progress') return;
      item.transferredBytes = Math.min(done, item.totalBytes);
      item.progress = item.totalBytes ? Math.min(99, Math.floor((item.transferredBytes / item.totalBytes) * 100)) : 0;
      this.publish(item);
    }, 700);

    this.active = { item, proc, timer };
    this.publish(item);

    let finished = false;
    const finish = (code: number | null, err?: Error) => {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      this.active = null;
      if (item.status === 'in-progress') {
        if (code === 0) {
          item.status = 'completed';
          item.transferredBytes = item.totalBytes;
          item.progress = 100;
        } else {
          item.status = 'error';
          item.error = (err?.message || lastLine(output) || `adb exited with code ${code}`).trim();
        }
      } else if (req.direction === 'pull') {
        fs.rmSync(item.destinationPath, { recursive: true, force: true });
      }
      item.completedAt = Date.now();
      this.publish(item);
      this.next();
    };
    proc.on('error', (e) => finish(-1, e));
    proc.on('close', (code) => finish(code));
  }

  private publish(item: TransferItem): void {
    this.emit({
      id: item.id,
      transferredBytes: item.transferredBytes,
      totalBytes: item.totalBytes,
      progress: item.progress,
      status: item.status,
    }, this.strip(item));
  }

  private strip(item: TransferItem & { req?: AdbTransferRequest }): TransferItem {
    const { req: _req, ...rest } = item as any;
    return { ...rest };
  }
}

function lastLine(s: string): string {
  return s.trim().split('\n').filter(Boolean).pop() ?? '';
}
