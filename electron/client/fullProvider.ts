import browserUtils from './browserUtils.js';
import cryptoUtils from './cryptoUtils.js';
import fileUtils from './fileUtils.js';
import diffUtils from './diffUtils';
import httpUtils from './httpUtils.js';
import messageUtils from './messageUtils.js';
import systemUtils from './systemUtils.js';
import pathUtils from './pathUtils.js';
import fontUtils from './fontUtils.js';
import appUtils from './appUtils.js';

import appInfo from '../../package.json';

function toVersionNumber(version: string) {
    const [major, minor, patch] = (
        version.split('.').map((str) => parseInt(str, 10))
    );
    return major * 10000 + minor * 100 + patch;
}

export const provider = {
    appType: 'desktop',
    isDesktop: true,
    fontUtils,
    cryptoUtils,
    browserUtils,
    messageUtils,
    httpUtils,
    pathUtils,
    fileUtils,
    diffUtils,
    systemUtils,
    appInfo: {
        name: appInfo.name,
        description: appInfo.description,
        author: appInfo.author,
        homepage: appInfo.homepage,
        version: appInfo.version,
        versionNumber: toVersionNumber(appInfo.version),
    },
    reload: () => {
        window.location.reload();
    },
    appUtils,
};
