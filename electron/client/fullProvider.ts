import browserUtils from './browserUtils';
import cryptoUtils from './cryptoUtils';
import fileUtils from './fileUtils';
import httpUtils from './httpUtils';
import messageUtils from './messageUtils';
import systemUtils from './systemUtils';
import pathUtils from './pathUtils';
import appInfo from '../../package.json';
import fontUtils from './fontUtils';
import appUtils from './appUtils';
import pdfUtils from './pdfUtils';
import { htmlFiles } from '../fsServe';


function toVersionNumber(version: string) {
    const [major, minor, patch] = (
        version.split('.').map((str) => parseInt(str, 10))
    );
    return major * 10000 + minor * 100 + patch;
}

const provider = {
    isPresenter: true,
    isReader: false,
    isScreen: false,
    appType: 'desktop',
    isDesktop: true,
    fontUtils,
    cryptoUtils,
    browserUtils,
    messageUtils,
    httpUtils,
    pathUtils,
    fileUtils,
    systemUtils,
    pdfUtils,
    appInfo: {
        name: appInfo.name,
        description: appInfo.description,
        author: appInfo.author,
        homepage: appInfo.homepage,
        version: appInfo.version,
        versionNumber: toVersionNumber(appInfo.version),
    },
    presenterHomePage: `/${htmlFiles.presenter}`,
    readerHomePage: `/${htmlFiles.reader}`,
    reload: () => {
        window.location.reload();
    },
    appUtils,
};

export default provider;
