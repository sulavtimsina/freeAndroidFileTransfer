import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { shQuote } from '../src/main/adb/adb';
import { parseStatOutput, sortEntries, toDevicePath } from '../src/main/adb/adbFiles';
import { parseDevicesOutput, parseDfOutput } from '../src/main/adb/adbDevices';
import { uniqueLocalPath } from '../src/main/adb/adbTransfer';

describe('adb helpers', () => {
  describe('shQuote', () => {
    it('wraps plain values in single quotes', () => {
      expect(shQuote('/sdcard/My Photos')).toBe(`'/sdcard/My Photos'`);
    });

    it('escapes embedded single quotes', () => {
      expect(shQuote(`it's`)).toBe(`'it'\\''s'`);
    });
  });

  describe('toDevicePath', () => {
    it('maps the UI root to /sdcard', () => {
      expect(toDevicePath('/')).toBe('/sdcard');
    });

    it('maps nested paths and collapses slashes', () => {
      expect(toDevicePath('/DCIM//Camera/')).toBe('/sdcard/DCIM/Camera');
    });
  });

  describe('parseStatOutput', () => {
    const output = [
      'directory|3488|1700000000|/sdcard/DCIM/Camera',
      'regular file|2048|1700000100|/sdcard/DCIM/a|b.jpg',
      'regular empty file|0|1700000200|/sdcard/DCIM/empty.txt\r',
      'garbage line',
    ].join('\n');

    it('parses directories and files with names containing "|"', () => {
      const entries = parseStatOutput(output, '/DCIM');
      expect(entries).toHaveLength(3);
      expect(entries[0]).toMatchObject({ name: 'Camera', path: '/DCIM/Camera', type: 'directory', size: 0, fileType: 'folder' });
      expect(entries[1]).toMatchObject({ name: 'a|b.jpg', type: 'file', size: 2048, fileType: 'image', modifiedAt: 1700000100000 });
      expect(entries[2].name).toBe('empty.txt');
    });

    it('builds root-level paths without a double slash', () => {
      const [entry] = parseStatOutput('directory|0|0|/sdcard/Download', '/');
      expect(entry.path).toBe('/Download');
    });
  });

  describe('sortEntries', () => {
    it('keeps folders first and sorts names case-insensitively', () => {
      const entries = parseStatOutput([
        'regular file|1|0|/sdcard/b.txt',
        'directory|0|0|/sdcard/Zed',
        'regular file|1|0|/sdcard/A.txt',
      ].join('\n'), '/');
      expect(sortEntries(entries).map((e) => e.name)).toEqual(['Zed', 'A.txt', 'b.txt']);
    });
  });

  describe('parseDevicesOutput', () => {
    it('reads serial, state and model', () => {
      const out = 'List of devices attached\nR58M123 device usb:1-1 product:x model:Galaxy_S21 device:y transport_id:1\nemulator-5554 unauthorized transport_id:2\n\n';
      expect(parseDevicesOutput(out)).toEqual([
        { serial: 'R58M123', state: 'device', model: 'Galaxy S21' },
        { serial: 'emulator-5554', state: 'unauthorized', model: undefined },
      ]);
    });

    it('returns nothing when no device is attached', () => {
      expect(parseDevicesOutput('List of devices attached\n\n')).toEqual([]);
    });
  });

  describe('parseDfOutput', () => {
    it('converts 1K blocks to bytes', () => {
      const out = 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/fuse       6000000 2000000   4000000  34% /storage/emulated\n';
      expect(parseDfOutput(out)).toMatchObject({ totalBytes: 6000000 * 1024, usedBytes: 2000000 * 1024, freeBytes: 4000000 * 1024 });
    });

    it('returns null for unusable output', () => {
      expect(parseDfOutput('df: /sdcard/: No such file')).toBeNull();
    });
  });

  describe('uniqueLocalPath', () => {
    it('adds a counter before the extension when the name is taken', () => {
      const taken = new Set([path.join('/out', 'a.jpg'), path.join('/out', 'a (1).jpg')]);
      expect(uniqueLocalPath('/out', 'a.jpg', (p) => taken.has(p))).toBe(path.join('/out', 'a (2).jpg'));
    });

    it('keeps the name when it is free', () => {
      expect(uniqueLocalPath('/out', 'Camera', () => false)).toBe(path.join('/out', 'Camera'));
    });
  });
});
