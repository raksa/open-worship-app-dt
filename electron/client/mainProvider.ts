import browserUtils from './browserUtils';
import cryptoUtils from './cryptoUtils';
import fileUtils from './fileUtils';
import httpUtils from './httpUtils';
import messageUtils from './messageUtils';
import systemUtils from './systemUtils';
import pathUtils from './pathUtils';

const fontList = require('font-list');

const provider = {
    fontList,
    cryptoUtils,
    browserUtils,
    messageUtils,
    httpUtils,
    pathUtils,
    fileUtils,
    systemUtils,
};

export default provider;
