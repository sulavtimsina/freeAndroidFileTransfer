import { useState, useEffect, useCallback } from 'react';
import { Device, DeviceEvent, ConnectionStatus } from '../../shared/types';

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
      } else if (event.type === 'error') {
        setError(event.error ?? 'Unknown error');
        setStatus('error');
      }
    });

    return () => { window.electronAPI.device.removeDeviceListener(); };
  }, []);

  const connect = useCallback(async () => {
    setStatus('connecting');
    try {
      const dev = await window.electronAPI.device.simulateConnect();
      setDevice(dev);
      setStatus('connected');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(async () => {
    await window.electronAPI.device.simulateDisconnect();
    setDevice(null);
    setStatus('disconnected');
  }, []);

  return { device, status, error, connect, disconnect };
}
