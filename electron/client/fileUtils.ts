import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import { createInterface } from 'node:readline';

const fileUtils = {
    createWriteStream: fs.createWriteStream,
    createReadStream: fs.createReadStream,
    createInterface: createInterface,

    stat: fs.stat,
    statSync: fs.statSync,
    statPromise: fsPromise.stat,

    readdir: fs.readdir,
    readdirSync: fs.readdirSync,
    readdirPromise: fsPromise.readdir,

    mkdir: fs.mkdir,
    mkdirSync: fs.mkdirSync,
    mkdirPromise: fsPromise.mkdir,

    rmdir: fs.rmdir,
    rmdirSync: fs.rmdirSync,
    rmdirPromise: fsPromise.rmdir,

    readFile: fs.readFile,
    readFileSync: fs.readFileSync,
    readFilePromise: fsPromise.readFile,

    writeFile: fs.writeFile,
    writeFileSync: fs.writeFileSync,
    writeFilePromise: fsPromise.writeFile,

    rename: fs.rename,
    renameSync: fs.renameSync,
    renamePromise: fsPromise.rename,

    unlink: fs.unlink,
    unlinkSync: fs.unlinkSync,
    unlinkPromise: fsPromise.unlink,


    copyFile: fs.copyFile,
    copyFileSync: fs.copyFileSync,
    copyFilePromise: fsPromise.copyFile,

    appendFile: fs.appendFile,
    appendFileSync: fs.appendFileSync,
    appendFilePromise: fsPromise.appendFile,

    tarExtract: function () {
        const tar = require('tar');
        return tar.x(...arguments);
    },
    watch: fs.watch,
};

export default fileUtils;
