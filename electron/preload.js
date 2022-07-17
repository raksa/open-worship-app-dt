'use strict';

const https = require('https');
const crypto = require('crypto');
const bibleObj = require('./bible.json');
const fs = require('fs');
const path = require('path');
const electron = require('electron');
const url = require('url');
const fontList = require('font-list');
const ipcRenderer = electron.ipcRenderer;

const httpsProvider = {
    request(options, callback) {
        const httpsInfo = ipcRenderer.sendSync('app:app:https-credential');
        options.hostname = httpsInfo.apiUrl.substring(8);
        options.headers = {
            ...(options.headers || {}),
            'x-api-key': httpsInfo.apiKey,
        };
        return https.request(options, callback);
    },
};

const ALGORITHM = 'aes-256-cbc';
const IV_STRING = '6ce2b3237d3d6690';

function encrypt(text, key) {
    const cipher = crypto.createCipheriv(ALGORITHM, key, IV_STRING);
    let encrypted = cipher.update(text);
    encrypted = Buffer.from(new Uint8Array([...encrypted, ...(cipher.final())]));
    return encrypted.toString('base64');
}

function decrypt(text, key) {
    const encryptedText = Buffer.from(text, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, IV_STRING);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.from(new Uint8Array([...decrypted, ...(decipher.final())]));
    return decrypted.toString();
}

const provider = {
    https: httpsProvider,
    cipher: {
        encrypt,
        decrypt,
    },
    bibleObj,
    fs,
    path,
    electron,
    ipcRenderer,
    crypto,
    url,
    fontList,
};

global.provider = window.provider = provider;
