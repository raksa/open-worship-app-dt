import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const systemUtils = {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  is64System: process.arch === 'x64',
};

function genFileName(baseName) {
  const suffix = systemUtils.is64System ? '' : '-i386';
  if (systemUtils.isWindows) {
    return [
      {
        fts5FileName: `${baseName}${suffix}.dll`,
        destFileName: `${baseName}.dll`,
      },
    ];
  }
  if (systemUtils.isMac) {
    return [
      { fts5FileName: `${baseName}.dylib`, destFileName: baseName },
      {
        fts5FileName: `${baseName}-int.dylib`,
        destFileName: `${baseName}-int`,
      },
    ];
  }
  if (systemUtils.isLinux) {
    return [
      { fts5FileName: `${baseName}${suffix}.so`, destFileName: baseName },
    ];
  }
  throw new Error('Unsupported OS');
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
  genFileName(baseName).forEach(({ fts5FileName, destFileName }) => {
    copy(fts5FileName, destFileName);
  });
});
