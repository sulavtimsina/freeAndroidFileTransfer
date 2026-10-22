#!/usr/bin/env bash
# Downloads Google's platform-tools and keeps only adb, which the app bundles
# (Contents/Resources/adb) so users don't have to install anything.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=vendor/adb
if [ -x "$DEST/adb" ]; then
  echo "adb already present in $DEST"
  exit 0
fi
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -fsSL -o "$TMP/pt.zip" https://dl.google.com/android/repository/platform-tools-latest-darwin.zip
unzip -q "$TMP/pt.zip" -d "$TMP"
mkdir -p "$DEST"
cp "$TMP/platform-tools/adb" "$TMP/platform-tools/NOTICE.txt" "$TMP/platform-tools/source.properties" "$DEST/"
"$DEST/adb" version | head -2
