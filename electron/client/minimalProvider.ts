import fileUtils from './fileUtils';
import messageUtils from './messageUtils';
import systemUtils from './systemUtils';
import pathUtils from './pathUtils';
import appUtils from './appUtils';

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
