import { useState, useEffect } from 'react';
import { Device, DeviceEvent, ConnectionStatus } from '../../shared/types';

/** Tracks the phone the main process finds over adb (it polls every 2s). */
export function useDevice() {
  const [device, setDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.electronAPI.device.getConnectedDevice().then((dev) => {
      if (dev) { setDevice(dev); setStatus(dev.connectionStatus); }
    });

    window.electronAPI.device.onDeviceEvent((event: DeviceEvent) => {
      if (event.type === 'connected' && event.device) {
        setDevice(event.device);
        setStatus(event.device.connectionStatus);
        setError(null);
      } else if (event.type === 'disconnected') {
        setDevice(null);
        setStatus('disconnected');
        setError(null);
      } else if (event.type === 'error') {
        setDevice(null);
        setError(event.error ?? 'Unknown error');
        setStatus('error');
      }
    });

    return () => { window.electronAPI.device.removeDeviceListener(); };
  }, []);

  return { device, status, error };
}
