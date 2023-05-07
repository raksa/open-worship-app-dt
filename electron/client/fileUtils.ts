const fs = require('node:fs');

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
    tarExtract: function () {
        const tar = require('tar');
        return tar.x(...arguments);
    },
    watch: fs.watch,
};

export default fileUtils;
