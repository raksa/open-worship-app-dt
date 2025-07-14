'use strict';
/* eslint-disable */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const { platform, arch } = process;
const systemUtils = {
  isWindows: platform === 'win32',
  isMac: platform === 'darwin',
  isLinux: platform === 'linux',
  is64System: process.env.FORCE_ARCH_32 == 'true' ? false : arch === 'x64',
  isArm64: arch === 'arm64',
  isMacUniversal: process.env.FORCE_UNIVERSAL == 'true',
};

function getFileSuffix() {
  let suffix = '';
  if (systemUtils.isMac) {
    if (systemUtils.isMacUniversal || !systemUtils.isArm64) {
      suffix = '-int';
    }
  } else {
    if (systemUtils.isArm64) {
      suffix = '-arm64';
    } else if (!systemUtils.is64System) {
      suffix = '-i386';
    }
  }
  return suffix;
}
function genFileName(baseName) {
  let ext;
  if (systemUtils.isWindows) {
    ext = 'dll';
  } else if (systemUtils.isMac) {
    ext = 'dylib';
  } else {
    ext = 'so';
  }
  const suffix = getFileSuffix();
  return {
    fts5FileName: `${baseName}${suffix}.${ext}`,
    destFileName: `${baseName}.${ext}`,
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

function checkIsFile(filePath) {
  const stats = existsSync(filePath) ? statSync(filePath) : null;
  return stats && stats.isFile();
}
function copyAllChildren(source, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const children = readdirSync(source);
  for (const child of children) {
    const sourceChild = join(source, child);
    const destChild = join(dest, child);
    if (checkIsFile(sourceChild)) {
      copyFileSync(sourceChild, destChild);
    } else {
      copyAllChildren(sourceChild, destChild);
    }
  }
}

const powerPointHelperSource = resolve(
  './extra-work/powerpoint-helper/dist/net8.0',
);
const powerPointHelperDest = resolve(
  './electron-build/powerpoint-helper/net8.0',
);
copyAllChildren(powerPointHelperSource, powerPointHelperDest);
console.log('Copied PowerPoint lib files to:', powerPointHelperDest);

const binSource = resolve(
  `./extra-work/powerpoint-helper/dist/bin${getFileSuffix()}`,
);
const binDest = resolve('./electron-build/powerpoint-helper/bin');
copyAllChildren(binSource, binDest);
console.log('Copied PowerPoint bin files to:', binDest);
