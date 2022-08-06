import fileUtils from './fileUtils';
import messageUtils from './messageUtils';
import systemUtils from './systemUtils';
import pathUtils from './pathUtils';

const provider = {
    isMain: false,
    isPresent: true,
    messageUtils,
    fileUtils,
    pathUtils,
    systemUtils,
};

export default provider;
