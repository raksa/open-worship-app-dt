import browserUtils from './browserUtils';
import cryptoUtils from './cryptoUtils';
import fileUtils from './fileUtils';
import httpUtils from './httpUtils';
import messageUtils from './messageUtils';
import pathUtils from './pathUtils';

const fs = require('fs');
const path = require('path');
const fontList = require('font-list');

const provider = {
    fs,
    path,
    fontList,
    cryptoUtils,
    browserUtils,
    messageUtils,
    httpUtils,
    pathUtils,
    fileUtils,
};

export default provider;
