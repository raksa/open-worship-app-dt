import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const systemUtils = {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  is64System: process.arch === 'x64',
  isArm64: process.arch === 'arm64',
};
function genFileName(baseName) {
  if (systemUtils.isWindows) {
    return `${baseName}${systemUtils.is64System ? '' : '-i386'}.dll`;
  } else if (systemUtils.isMac) {
    return `${baseName}${systemUtils.isArm64 ? '' : '-int'}.dylib`;
  } else if (systemUtils.isLinux) {
    return `${baseName}${systemUtils.is64System ? '' : '-i386'}.so`;
  } else {
    throw new Error('Unsupported OS');
  }
}
const basePath = {
  source: resolve('./extra-work/db-exts'),
  destination: resolve('./electron-build/db-exts'),
};
function copy(fileFullName, destFileFullName) {
  if (!existsSync(basePath.destination)) {
    mkdirSync(basePath.destination, { recursive: true });
  }
  const destFilePath = join(basePath.destination, destFileFullName);
  if (existsSync(destFilePath)) {
    unlinkSync(destFilePath);
  }
  copyFileSync(join(basePath.source, fileFullName), destFilePath);
}
for (const baseName of ['fts5', 'spellfix1']) {
  const fts5FileName = genFileName(baseName);
  copy(fts5FileName, baseName);
}
