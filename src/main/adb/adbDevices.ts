/**
 * Device discovery over adb: parses `adb devices -l` and reads model/storage info.
 */
import { runAdb, adbShell } from './adb';
import { Device, StorageInfo } from '../../shared/types';
import { DEVICE_ROOT } from './adbFiles';

export interface AdbDeviceLine {
  serial: string;
  state: string; // device | unauthorized | offline | ...
  model?: string;
}

export function parseDevicesOutput(output: string): AdbDeviceLine[] {
  return output
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state, ...rest] = line.split(/\s+/);
      const model = rest.find((r) => r.startsWith('model:'))?.slice(6).replace(/_/g, ' ');
      return { serial, state, model };
    })
    .filter((d) => d.serial && d.state);
}

/** Parse `df -k <path>` output into storage info. */
export function parseDfOutput(output: string): StorageInfo | null {
  const lines = output.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return null;
  const cols = lines[lines.length - 1].trim().split(/\s+/);
  const total = Number(cols[1]) * 1024;
  const used = Number(cols[2]) * 1024;
  const free = Number(cols[3]) * 1024;
  if (!Number.isFinite(total) || total <= 0) return null;
  return { id: 'internal', label: 'Internal Storage', totalBytes: total, usedBytes: used, freeBytes: free, type: 'internal' };
}

export async function listAdbDevices(): Promise<AdbDeviceLine[]> {
  return parseDevicesOutput(await runAdb(['devices', '-l'], 10000));
}

export async function describeDevice(line: AdbDeviceLine): Promise<Device> {
  const props = await adbShell(line.serial, 'getprop ro.product.manufacturer; getprop ro.product.model', 10000);
  const [manufacturer = 'Android', model = line.model ?? 'Device'] = props.split('\n').map((s) => s.trim());
  const storage = parseDfOutput(await adbShell(line.serial, `df -k ${DEVICE_ROOT}/`, 10000).catch(() => ''));
  return {
    id: line.serial,
    name: model || line.model || 'Android device',
    manufacturer,
    model,
    serialNumber: line.serial,
    storage: storage ? [storage] : [],
    connectionStatus: 'connected',
  };
}
