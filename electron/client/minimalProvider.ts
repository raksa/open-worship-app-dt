import fileUtils from './fileUtils.js';
import messageUtils from './messageUtils.js';
import systemUtils from './systemUtils.js';
import pathUtils from './pathUtils.js';
import appUtils from './appUtils.js';

export const provider = {
    isPresenter: false,
    isScreen: true,
    isReader: false,
    messageUtils,
    fileUtils,
    pathUtils,
    systemUtils,
    appUtils,
};

