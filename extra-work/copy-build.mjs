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
  const ext = systemUtils.isWindows
    ? 'dll'
    : systemUtils.isMac
      ? 'dylib'
      : 'so';
  let suffix = '';
  if (systemUtils.isMac) {
    if (!systemUtils.isArm64) {
      suffix = '-int';
    }
  } else if (!systemUtils.is64System) {
    suffix = '-i386';
  }
  return {
    fts5FileName: `${baseName}${suffix}.${ext}`,
    destFileName: baseName,
  };
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
  if (existsSync(destFilePath)) unlinkSync(destFilePath);
  copyFileSync(join(basePath.source, fileFullName), destFilePath);
}

['fts5', 'spellfix1'].forEach((baseName) => {
  const { fts5FileName, destFileName } = genFileName(baseName);
  console.log('Copy:', fts5FileName, destFileName);
  copy(fts5FileName, destFileName);
});
