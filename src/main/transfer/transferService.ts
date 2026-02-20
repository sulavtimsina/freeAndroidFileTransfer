import { BrowserWindow } from 'electron';
import {
  TransferItem,
  TransferRequest,
  TransferProgress,
  TransferStatus,
} from '../../shared/types';

let transferIdCounter = 0;

function generateId(): string {
  return `transfer-${++transferIdCounter}-${Date.now()}`;
}

export class TransferService {
  private queue: TransferItem[] = [];
  private activeTransfer: TransferItem | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private window: BrowserWindow | null = null;

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  async startTransfer(request: TransferRequest): Promise<TransferItem> {
    const item: TransferItem = {
      id: generateId(),
      fileName: request.fileName,
      sourcePath: request.sourcePath,
      destinationPath: request.destinationPath,
      direction: request.direction,
      totalBytes: request.totalBytes,
      transferredBytes: 0,
      status: 'queued',
      progress: 0,
    };

    this.queue.push(item);
    this.processNext();
    return item;
  }

  async cancelTransfer(id: string): Promise<void> {
    const item = this.queue.find((t) => t.id === id);
    if (!item) return;

    if (item.status === 'in-progress') {
      item.status = 'cancelled';
      item.completedAt = Date.now();
      this.activeTransfer = null;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.emitProgress(item);
      this.processNext();
    } else if (item.status === 'queued') {
      item.status = 'cancelled';
      item.completedAt = Date.now();
      this.emitProgress(item);
    }
  }

  getQueue(): TransferItem[] {
    return [...this.queue];
  }

  private processNext() {
    if (this.activeTransfer) return;

    const next = this.queue.find((t) => t.status === 'queued');
    if (!next) return;

    next.status = 'in-progress';
    next.startedAt = Date.now();
    this.activeTransfer = next;

    // Simulate transfer progress with interval
    const chunkSize = Math.max(1024, Math.floor(next.totalBytes / 20));
    this.timer = setInterval(() => {
      if (!this.activeTransfer || this.activeTransfer.status !== 'in-progress') {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        return;
      }

      this.activeTransfer.transferredBytes = Math.min(
        this.activeTransfer.transferredBytes + chunkSize,
        this.activeTransfer.totalBytes
      );
      this.activeTransfer.progress = Math.round(
        (this.activeTransfer.transferredBytes / this.activeTransfer.totalBytes) * 100
      );

      this.emitProgress(this.activeTransfer);

      if (this.activeTransfer.transferredBytes >= this.activeTransfer.totalBytes) {
        this.activeTransfer.status = 'completed';
        this.activeTransfer.completedAt = Date.now();
        this.emitProgress(this.activeTransfer);
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.activeTransfer = null;
        this.processNext();
      }
    }, 200);
  }

  private emitProgress(item: TransferItem) {
    const progress: TransferProgress = {
      id: item.id,
      transferredBytes: item.transferredBytes,
      totalBytes: item.totalBytes,
      progress: item.progress,
      status: item.status,
    };
    this.window?.webContents.send('transfer:progress', progress);
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const transferService = new TransferService();
