# Android File Transfer

Desktop app for transferring files between macOS and Android devices. Built with Electron + React + TypeScript.
It talks to the phone over **adb**, which ships inside the app, so nothing else needs to be installed on the Mac.

## Download and run (no npm needed)

1. Download the DMG for your Mac from the [Releases page](https://github.com/sulavtimsina/freeAndroidFileTransfer/releases/latest):
   - Apple Silicon (M1/M2/M3/M4): `Android File Transfer-<version>-arm64.dmg`
   - Intel: `Android File Transfer-<version>-x64.dmg`
2. Open the DMG and drag **Android File Transfer** into **Applications**.
3. The app is not notarized by Apple, so the first launch is blocked. Either:
   - open it once, then go to **System Settings → Privacy & Security** and click **Open Anyway**, or
   - run `xattr -cr "/Applications/Android File Transfer.app"` in Terminal, then open it normally.

### Phone setup (one time)

1. On the phone open **Settings → About phone** and tap **Build number** 7 times to enable Developer options.
2. Open **Settings → System → Developer options** and turn on **USB debugging**.
3. Plug the phone into the Mac with a USB *data* cable, unlock it and tap **Allow** on the "Allow USB debugging?" prompt.

The phone appears in the app within a couple of seconds. You can browse internal storage, upload (button or drag
and drop), download (button, double-click a file, or right-click), rename, create folders and delete.

## Building from source

### Prerequisites

- Node.js >= 18
- npm >= 9

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts the Vite dev server (port 5173) and launches Electron with hot reload.

## Production Build

```bash
npm run build
```

Downloads adb into `vendor/adb` (via `scripts/fetch-adb.sh`), then outputs `arm64` and `x64` DMGs in `release/`.
The app is ad-hoc signed (`scripts/adhoc-sign.js`); there is no Developer ID signing or notarization.

## Testing

```bash
npm test              # single run
npm run test:watch    # watch mode
```

## Linting & Formatting

```bash
npm run lint          # check
npm run lint:fix      # auto-fix
npm run format        # prettier
```

## Project Structure

```
src/
  main/         # Electron main process
    adb/        # adb backend: device discovery, file operations, push/pull transfer queue
  renderer/     # React app (renderer process)
    components/ # React components
    styles/     # CSS
  shared/       # Types/utils shared between main & renderer
tests/          # Test files
```
