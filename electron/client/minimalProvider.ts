import fileUtils from './fileUtils';
import messageUtils from './messageUtils';
import systemUtils from './systemUtils';
import pathUtils from './pathUtils';
import appUtils from './appUtils';

const provider = {
    isMain: false,
    isScreen: true,
    messageUtils,
    fileUtils,
    pathUtils,
    systemUtils,
    appUtils,
};

export default provider;
