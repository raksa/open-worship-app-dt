import browserUtils from './browserUtils';
import cryptoUtils from './cryptoUtils';
import fileUtils from './fileUtils';
import httpUtils from './httpUtils';
import messageUtils from './messageUtils';
import systemUtils from './systemUtils';
import pathUtils from './pathUtils';
import appInfo from '../../package.json';
import fontUtils from './fontUtils';

const provider = {
    isMain: true,
    isPresent: false,
    fontUtils,
    cryptoUtils,
    browserUtils,
    messageUtils,
    httpUtils,
    pathUtils,
    fileUtils,
    systemUtils,
    appInfo: {
        name: appInfo.name,
        description: appInfo.description,
        author: appInfo.author,
        homepage: appInfo.homepage,
        version: appInfo.version,
    },
};

export default provider;
