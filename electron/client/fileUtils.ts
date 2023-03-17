const fs = require('node:fs');
const tar = require('tar');

const fileUtils = {
    createWriteStream: fs.createWriteStream,
    readdir: fs.readdir,
    stat: fs.stat,
    mkdir: fs.mkdir,
    writeFile: fs.writeFile,
    rename: fs.rename,
    unlink: fs.unlink,
    rmdir: fs.rmdir,
    readFile: fs.readFile,
    copyFile: fs.copyFile,
    tarExtract: tar.x,
    watch: fs.watch,
};

export default fileUtils;
