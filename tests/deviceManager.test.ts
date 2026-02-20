import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeviceManager } from '../src/main/usb/deviceManager';

describe('DeviceManager', () => {
  let dm: DeviceManager;
  beforeEach(() => { dm = new DeviceManager(); });
  afterEach(() => { dm.destroy(); });

  it('starts with no connected device', () => {
    expect(dm.getConnectedDevice()).toBeNull();
  });

  it('simulateConnect returns a connected device', async () => {
    const device = await dm.simulateConnect();
    expect(device.connectionStatus).toBe('connected');
    expect(dm.getConnectedDevice()).toBe(device);
  });

  it('simulateDisconnect clears the device', async () => {
    await dm.simulateConnect();
    await dm.simulateDisconnect();
    expect(dm.getConnectedDevice()).toBeNull();
  });

  it('emits connecting then connected events', async () => {
    const events: any[] = [];
    dm.on('device-event', (e) => events.push(e));
    await dm.simulateConnect();
    expect(events.length).toBe(2);
    expect(events[0].device.connectionStatus).toBe('connecting');
    expect(events[1].device.connectionStatus).toBe('connected');
  });

  it('emits disconnected event', async () => {
    await dm.simulateConnect();
    const events: any[] = [];
    dm.on('device-event', (e) => events.push(e));
    await dm.simulateDisconnect();
    expect(events[0].type).toBe('disconnected');
  });

  it('accepts partial device overrides', async () => {
    const device = await dm.simulateConnect({ name: 'Samsung Galaxy S24' });
    expect(device.name).toBe('Samsung Galaxy S24');
  });

  it('destroy removes listeners', () => {
    dm.on('device-event', () => {});
    dm.destroy();
    expect(dm.listenerCount('device-event')).toBe(0);
  });
});
