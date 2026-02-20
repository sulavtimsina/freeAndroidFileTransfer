# Android File Transfer

Desktop app for transferring files between macOS and Android devices. Built with Electron + React + TypeScript.

## Prerequisites

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

Outputs a macOS DMG in `release/`.

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
  renderer/     # React app (renderer process)
    components/ # React components
    styles/     # CSS
  shared/       # Types/utils shared between main & renderer
tests/          # Test files
```
