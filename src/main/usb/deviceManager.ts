import { EventEmitter } from 'events';
import { Device, DeviceEvent } from '../../shared/types';
import { listAdbDevices, describeDevice } from '../adb/adbDevices';

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
  private polling = false;
  private lastError: string | null = null;

  constructor() {
    super();
  }

  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  /** Watch `adb devices` and emit connect/disconnect/error events as phones come and go. */
  startPolling(intervalMs = 2000): void {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => { void this.poll(); }, intervalMs);
    void this.poll();
  }

  private async poll(): Promise<void> {
    if (this.polling) return;
    this.polling = true;
    try {
      const lines = await listAdbDevices();
      const ready = lines.find((l) => l.state === 'device');
      if (ready) {
        if (this.connectedDevice?.id !== ready.serial) {
          const dev = await describeDevice(ready);
          this.connectedDevice = dev;
          this.lastError = null;
          this.emit('device-event', { type: 'connected', device: dev } as DeviceEvent);
        }
        return;
      }
      if (this.connectedDevice) await this.simulateDisconnect();
      const pending = lines[0];
      const error = !pending ? null
        : pending.state === 'unauthorized' ? 'Unlock your phone and tap "Allow" on the USB debugging prompt.'
        : `Phone is ${pending.state}. Try unplugging and reconnecting the cable.`;
      this.setError(error);
    } catch (e: any) {
      this.setError(`adb error: ${e.message}`);
    } finally {
      this.polling = false;
    }
  }

  private setError(error: string | null): void {
    if (error === this.lastError) return;
    this.lastError = error;
    this.emit('device-event', error
      ? { type: 'error', error } as DeviceEvent
      : { type: 'disconnected' } as DeviceEvent);
  }

  /** Re-read storage numbers after files change. */
  async refresh(): Promise<Device | null> {
    if (!this.connectedDevice) return null;
    this.connectedDevice = await describeDevice({ serial: this.connectedDevice.id, state: 'device' });
    this.emit('device-event', { type: 'connected', device: this.connectedDevice } as DeviceEvent);
    return this.connectedDevice;
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
