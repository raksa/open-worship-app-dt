const fs = require('fs');

const fileUtils = {
    createWriteStream: fs.createWriteStream,
    readdir: fs.readdir,
    stat: fs.stat,
    mkdirSync: fs.mkdirSync,
    writeFileSync: fs.writeFileSync,
    renameSync: fs.renameSync,
    unlinkSync: fs.unlinkSync,
    readFileSync: fs.readFileSync,
    copyFileSync: fs.copyFileSync,
};

export default fileUtils;
