import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransferService } from '../src/main/transfer/transferService';
import { TransferRequest } from '../src/shared/types';

// Mock electron
vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
}));

describe('TransferService', () => {
  let service: TransferService;

  const mockRequest: TransferRequest = {
    sourcePath: '/sdcard/DCIM/photo.jpg',
    destinationPath: '/Users/test/Downloads/photo.jpg',
    direction: 'pull',
    fileName: 'photo.jpg',
    totalBytes: 1024 * 100,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    service = new TransferService();
  });

  afterEach(() => {
    service.destroy();
    vi.useRealTimers();
  });

  it('should create a transfer and start processing', async () => {
    const item = await service.startTransfer(mockRequest);
    // First item immediately starts processing
    expect(item.fileName).toBe('photo.jpg');
    expect(item.progress).toBe(0);
    expect(item.id).toMatch(/^transfer-/);
    const queue = service.getQueue();
    expect(queue[0].status).toBe('in-progress');
  });

  it('should add transfer to queue', async () => {
    await service.startTransfer(mockRequest);
    const queue = service.getQueue();
    expect(queue).toHaveLength(1);
  });

  it('should process transfer and move to in-progress', async () => {
    await service.startTransfer(mockRequest);
    // processNext is called synchronously after startTransfer, 
    // the item transitions to in-progress
    const queue = service.getQueue();
    expect(queue[0].status).toBe('in-progress');
  });

  it('should simulate progress over time', async () => {
    await service.startTransfer(mockRequest);
    vi.advanceTimersByTime(600); // 3 ticks
    const queue = service.getQueue();
    expect(queue[0].transferredBytes).toBeGreaterThan(0);
    expect(queue[0].progress).toBeGreaterThan(0);
  });

  it('should complete transfer after enough time', async () => {
    await service.startTransfer(mockRequest);
    vi.advanceTimersByTime(10000); // plenty of time
    const queue = service.getQueue();
    expect(queue[0].status).toBe('completed');
    expect(queue[0].progress).toBe(100);
  });

  it('should cancel an in-progress transfer', async () => {
    const item = await service.startTransfer(mockRequest);
    vi.advanceTimersByTime(400);
    await service.cancelTransfer(item.id);
    const queue = service.getQueue();
    expect(queue[0].status).toBe('cancelled');
  });

  it('should cancel a queued transfer', async () => {
    // Start one to block, then queue another
    await service.startTransfer(mockRequest);
    const second = await service.startTransfer({
      ...mockRequest,
      fileName: 'second.jpg',
    });
    expect(second.status).toBe('queued');
    await service.cancelTransfer(second.id);
    const queue = service.getQueue();
    const cancelled = queue.find((t) => t.id === second.id);
    expect(cancelled?.status).toBe('cancelled');
  });

  it('should process next after completion', async () => {
    await service.startTransfer(mockRequest);
    await service.startTransfer({ ...mockRequest, fileName: 'second.jpg' });
    
    const queue = service.getQueue();
    expect(queue[0].status).toBe('in-progress');
    expect(queue[1].status).toBe('queued');

    vi.advanceTimersByTime(10000);
    const updated = service.getQueue();
    expect(updated[0].status).toBe('completed');
    // Second should now be in-progress or completed
    expect(['in-progress', 'completed']).toContain(updated[1].status);
  });

  it('should return a copy of the queue', async () => {
    await service.startTransfer(mockRequest);
    const q1 = service.getQueue();
    const q2 = service.getQueue();
    expect(q1).not.toBe(q2);
  });
});
