import { EventEmitter } from 'events';
import { Device, DeviceEvent } from '../../shared/types';

const SIMULATED_DEVICE: Device = {
  id: 'sim-pixel-7',
  name: 'Pixel 7',
  manufacturer: 'Google',
  model: 'Pixel 7',
  serialNumber: 'SIM00000001',
  storage: [
    {
      id: 'internal',
      label: 'Internal Storage',
      totalBytes: 128 * 1024 * 1024 * 1024,
      usedBytes: 72 * 1024 * 1024 * 1024,
      freeBytes: 56 * 1024 * 1024 * 1024,
      type: 'internal',
    },
    {
      id: 'sdcard',
      label: 'SD Card',
      totalBytes: 64 * 1024 * 1024 * 1024,
      usedBytes: 12 * 1024 * 1024 * 1024,
      freeBytes: 52 * 1024 * 1024 * 1024,
      type: 'sdcard',
    },
  ],
  connectionStatus: 'connected',
};

export class DeviceManager extends EventEmitter {
  private connectedDevice: Device | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
  }

  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  startPolling(intervalMs = 2000): void {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      // Real implementation: scan USB bus for MTP devices
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async simulateConnect(device?: Partial<Device>): Promise<Device> {
    const dev: Device = {
      ...SIMULATED_DEVICE,
      ...device,
      connectionStatus: 'connecting',
    };

    this.emit('device-event', { type: 'connected', device: { ...dev, connectionStatus: 'connecting' } } as DeviceEvent);

    await new Promise((r) => setTimeout(r, 500));

    dev.connectionStatus = 'connected';
    this.connectedDevice = dev;

    this.emit('device-event', { type: 'connected', device: dev } as DeviceEvent);
    return dev;
  }

  async simulateDisconnect(): Promise<void> {
    const dev = this.connectedDevice;
    this.connectedDevice = null;
    this.emit('device-event', { type: 'disconnected', device: dev ?? undefined } as DeviceEvent);
  }

  destroy(): void {
    this.stopPolling();
    this.removeAllListeners();
  }
}

let instance: DeviceManager | null = null;

export function getDeviceManager(): DeviceManager {
  if (!instance) {
    instance = new DeviceManager();
  }
  return instance;
}

export function resetDeviceManager(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}
