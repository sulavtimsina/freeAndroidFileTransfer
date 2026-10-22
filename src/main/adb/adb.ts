/**
 * Thin wrapper around the adb binary.
 * The packaged app ships adb in Contents/Resources/adb; in development we fall
 * back to vendor/adb or whatever adb is on the user's PATH.
 */
import { execFile, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

let cachedAdbPath: string | null = null;

export function resolveAdbPath(): string {
  if (cachedAdbPath) return cachedAdbPath;
  const candidates = [
    process.resourcesPath ? path.join(process.resourcesPath, 'adb', 'adb') : '',
    path.join(__dirname, '../../../vendor/adb/adb'),
    '/opt/homebrew/bin/adb',
    '/usr/local/bin/adb',
    path.join(process.env.HOME ?? '', 'Library/Android/sdk/platform-tools/adb'),
  ].filter(Boolean);
  cachedAdbPath = candidates.find((p) => fs.existsSync(p)) ?? 'adb';
  return cachedAdbPath;
}

export function runAdb(args: string[], timeoutMs = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(resolveAdbPath(), args, { timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error((stderr || stdout || err.message).trim()));
        return;
      }
      resolve(stdout);
    });
  });
}

export function spawnAdb(args: string[]): ChildProcess {
  return spawn(resolveAdbPath(), args);
}

/** Quote a value for the device's /system/bin/sh. */
export function shQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** Run a shell command on a device; fails if the command exits non-zero. */
export async function adbShell(serial: string, command: string, timeoutMs?: number): Promise<string> {
  // adb shell propagates exit codes on API 24+; the marker covers older devices.
  const out = await runAdb(['-s', serial, 'shell', `{ ${command}; } 2>&1; echo "__rc=$?"`], timeoutMs);
  const match = out.match(/__rc=(\d+)\s*$/);
  const body = out.replace(/__rc=\d+\s*$/, '');
  if (match && match[1] !== '0') throw new Error(body.trim() || `Command failed (exit ${match[1]})`);
  return body;
}
