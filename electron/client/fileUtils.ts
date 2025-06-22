import fs from 'node:fs';

const fileUtils = {
    createWriteStream: fs.createWriteStream,
    createReadStream: fs.createReadStream,
    readdir: fs.readdir,
    stat: fs.stat,
    mkdir: fs.mkdir,
    writeFile: fs.writeFile,
    rename: fs.rename,
    unlink: fs.unlink,
    rmdir: fs.rmdir,
    readFile: fs.readFile,
    readFileSync: fs.readFileSync,
    writeFileSync: fs.writeFileSync,
    unlinkSync: fs.unlinkSync,
    existsSync: fs.existsSync,
    mkdirSync: fs.mkdirSync,
    copyFile: fs.copyFile,
    watch: fs.watch,
};

export default fileUtils;
