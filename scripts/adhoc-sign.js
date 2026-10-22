// electron-builder afterPack hook: ad-hoc sign the app (no Apple Developer ID).
// Apple Silicon refuses to run unsigned code, and editing the bundle breaks
// Electron's original signature, so we re-sign everything with "-".
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' });
};
