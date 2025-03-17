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
  let fts5FileName = '';
  if (systemUtils.isWindows) {
    fts5FileName = `${baseName}${systemUtils.is64System ? '' : '-i386'}.dll`;
    baseName = `${baseName}.dll`;
  } else if (systemUtils.isMac) {
    fts5FileName = `${baseName}${systemUtils.isArm64 ? '' : '-int'}.dylib`;
  } else if (systemUtils.isLinux) {
    fts5FileName = `${baseName}${systemUtils.is64System ? '' : '-i386'}.so`;
  } else {
    throw new Error('Unsupported OS');
  }
  return { fts5FileName, destFileName: baseName };
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
  const { fts5FileName, destFileName } = genFileName(baseName);
  copy(fts5FileName, destFileName);
}
