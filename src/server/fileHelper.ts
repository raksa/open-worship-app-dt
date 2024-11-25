import { Stats } from 'node:fs';

import appProvider from './appProvider';
import FileSource from '../helper/FileSource';
import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from '../helper/errorHelpers';

import mimeBible from './mime/bible-types.json';
import mimeLyric from './mime/lyric-types.json';
import mimeSlide from './mime/slide-types.json';
import mimeImage from './mime/image-types.json';
import mimePlaylist from './mime/playlist-types.json';
import mimeVideo from './mime/video-types.json';

const appMimeTypesMapper = {
    bible: mimeBible,
    lyric: mimeLyric,
    slide: mimeSlide,
};
const _mimeTypes = Object.values(appMimeTypesMapper) as AppMimetypeType[][];
const appExtensions = _mimeTypes.reduce((acc: string[], cur) => {
    const exts = cur.map((mimeType) => {
        return mimeType.extensions;
    }).reduce((acc1, cur1) => {
        return acc1.concat(cur1);
    }, []);
    return acc.concat(exts);
}, []);

const mimeTypesMapper = {
    bible: mimeBible,
    lyric: mimeLyric,
    slide: mimeSlide,
    image: mimeImage,
    playlist: mimePlaylist,
    video: mimeVideo,
};

export type AppMimetypeType = {
    type: string,
    title: string,
    mimetype: string,
    mimetypeName: MimetypeNameType,
    extensions: string[],
};

export type FileMetadataType = {
    fileName: string,
    appMimetype: AppMimetypeType,
};

export function checkIsAppFile(fileName: string) {
    const ext = extractExtension(fileName);
    const isAppFile = appExtensions.includes(ext);
    return isAppFile;
}

export const pathSeparator = appProvider.pathUtils.sep;
export function pathJoin(filePath: string, fileName: string) {
    return appProvider.pathUtils.join(filePath, fileName);
}
export function pathBasename(filePath: string) {
    return appProvider.pathUtils.basename(filePath);
}

export const createNewFileDetail = async (dir: string, name: string,
    content: string, mimetype: MimetypeNameType) => {
    // TODO: verify file name before create
    const mimetypeList = getAppMimetype(mimetype);
    const fileName = `${name}${mimetypeList[0].extensions[0]}`;
    try {
        const filePath = pathJoin(dir, fileName);
        return await fsCreateFile(filePath,
            content);
    } catch (error: any) {
        showSimpleToast('Creating Playlist', error.message);
    }
    return null;
};

export const mimetypeNameTypeList = [
    'image', 'video', 'slide',
    'playlist', 'lyric', 'bible', 'other',
] as const;
export type MimetypeNameType = typeof mimetypeNameTypeList[number];

export function getFileMetaData(fileName: string,
    mimetypeList?: AppMimetypeType[]): FileMetadataType | null {
    mimetypeList = mimetypeList || getAllAppMimetype();
    const ext = extractExtension(fileName);
    const foundMT = mimetypeList.find((mt) => {
        return mt.extensions.includes(ext);
    });
    if (foundMT) {
        return { fileName, appMimetype: foundMT };
    }
    return null;
}

export function getAllAppMimetype() {
    return mimetypeNameTypeList.map((mimetypeName) => {
        return getAppMimetype(mimetypeName);
    }).reduce((acc, cur) => {
        return acc.concat(cur);
    }, []);
}

export function getAppMimetype(mimetype: MimetypeNameType) {
    if (mimetype === 'other') {
        return [];
    }
    const json = mimeTypesMapper[mimetype];
    json.forEach((data: any) => {
        data.mimetypeName = mimetype;
    });
    return json as AppMimetypeType[];
}
export function getMimetypeExtensions(mimetype: MimetypeNameType) {
    const imageTypes = getAppMimetype(mimetype);
    return imageTypes.reduce((r: string[], imageType) => {
        r.push(...imageType.extensions);
        return r;
    }, []).map((ext) => {
        return ext.replace('.', '');
    });
}

export function isSupportedMimetype(fileMimetype: string,
    mimetype: MimetypeNameType) {
    const mimetypeList = getAppMimetype(mimetype);
    return mimetypeList.map((newMimetype) => {
        return newMimetype.mimetype;
    }).some((type) => {
        return type === fileMimetype;
    });
}

export function extractExtension(fileName: string) {
    return fileName.substring(fileName.lastIndexOf('.'));
}
export function addExtension(name: string, extension: string) {
    return `${name}${extension}`;
}

export function isSupportedExt(
    fileName: string, mimetype: MimetypeNameType,
) {
    const mimetypeList = getAppMimetype(mimetype);
    const ext = extractExtension(fileName);
    return mimetypeList.map((newMimetype) => {
        return newMimetype.extensions;
    }).some((extensions) => {
        return extensions.includes(ext);
    });
}

export function fsCreateWriteStream(filePath: string) {
    return appProvider.fileUtils.createWriteStream(filePath);
}

export type FileResultType = {
    isFile: boolean,
    isDirectory: boolean,
    name: string,
    filePath: string,
};

function fsFilePromise<T>(fn: Function, ...args: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        args = args || [];
        args.push(function (error: any, ...args1: any) {
            if (error) {
                reject(error as Error);
            } else {
                args1 = args1 || [];
                (resolve as any)(...args1);
            }
        });
        fn(...args);
    });
}
function _fsStat(filePath: string) {
    return fsFilePromise<Stats>(appProvider.fileUtils.stat, filePath);
}
function _fsMkdir(dirPath: string, isRecursive: boolean) {
    return fsFilePromise<void>(appProvider.fileUtils.mkdir, dirPath, {
        recursive: isRecursive,
    });
}
function _fsRmdir(dirPath: string) {
    return fsFilePromise<void>(appProvider.fileUtils.rmdir, dirPath, {
        recursive: true,
    });
}
function _fsReaddir(dirPath: string) {
    return fsFilePromise<string[]>(appProvider.fileUtils.readdir, dirPath);
}
function _fsReadFile(filePath: string, options?: any) {
    return fsFilePromise<string>(
        appProvider.fileUtils.readFile, filePath, options,
    );
}
function _fsWriteFile(filePath: string, data: string, options?: any) {
    return fsFilePromise<void>(
        appProvider.fileUtils.writeFile, filePath, data, options,
    );
}
function _fsRename(oldPath: string, newPath: string) {
    return fsFilePromise<void>(appProvider.fileUtils.rename, oldPath, newPath);
}
function _fsUnlink(filePath: string) {
    return fsFilePromise<void>(appProvider.fileUtils.unlink, filePath);
}
function _fsCopyFile(src: string, dest: string) {
    return fsFilePromise<void>(appProvider.fileUtils.copyFile, src, dest);
}
async function _fsCheckExist(
    isFile: boolean, filePath: string, fileName?: string,
) {
    if (!filePath) {
        return false;
    }
    if (fileName) {
        filePath = pathJoin(filePath, fileName);
    }
    try {
        const stat = await _fsStat(filePath);
        if (isFile) {
            return stat.isFile();
        } else {
            return stat.isDirectory();
        }
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return false;
        } else {
            handleError(error);
            throw new Error('Error during checking file exist');
        }
    }
}
export function fsCheckDirExist(dirPath: string) {
    return _fsCheckExist(false, dirPath);
}
export function fsCheckFileExist(filePath: string, fileName?: string) {
    return _fsCheckExist(true, filePath, fileName);
}

export async function fsList(dir: string) {
    if (!dir) {
        return [];
    }
    try {
        const list = await _fsReaddir(dir);
        const fileList = [];
        for (const file of list) {
            try {
                const filePath = pathJoin(dir, file);
                const fileStat = await _fsStat(filePath);
                fileList.push({
                    isFile: fileStat.isFile(),
                    isDirectory: fileStat.isDirectory(),
                    name: file,
                    filePath,
                });
            } catch (error) {
                handleError(error);
            }
        }
        return fileList;
    } catch (error) {
        handleError(error);
        throw new Error('Error occurred during listing file');
    }
}

export async function fsListFiles(dirPath: string) {
    const list = await fsList(dirPath);
    return list.filter(({ isFile }) => {
        return isFile;
    }).map(({ name }) => {
        return name;
    });
}

export async function fsListDirectories(dirPath: string) {
    const list = await fsList(dirPath);
    return list.filter(({ isDirectory }) => {
        return isDirectory;
    }).map(({ name }) => {
        return name;
    });
}

export async function fsListFilesWithMimetype(
    dir: string, mimetype: MimetypeNameType,
) {
    if (!dir) {
        return [];
    }
    try {
        const mimetypeList = getAppMimetype(mimetype);
        const files = await fsListFiles(dir);
        const matchedFiles = files.map((fileName) => {
            return getFileMetaData(fileName, mimetypeList);
        }).filter((d) => {
            return !!d;
        });
        return matchedFiles.map((fileMetadata) => {
            return FileSource.getInstance(dir, fileMetadata.fileName).filePath;
        });
    } catch (error) {
        handleError(error);
        showSimpleToast('Getting File List',
            'Error occurred during listing file');
    }
    return null;
}

export function fsCreateDir(dirPath: string, isRecursive = true) {
    return _fsMkdir(dirPath, isRecursive);
}
export async function fsWriteFile(filePath: string, txt: string) {
    if (await fsCheckDirExist(filePath)) {
        throw new Error(`${filePath} is not a directory`);
    }
    await _fsWriteFile(filePath, txt, {
        encoding: 'utf8',
        flag: 'w',
    });
    return filePath;
}
export async function fsCreateFile(filePath: string,
    txt: string, isOverride?: boolean) {
    if (await fsCheckDirExist(filePath)) {
        throw new Error(`${filePath} is not a directory`);
    }
    if (await fsCheckFileExist(filePath)) {
        if (isOverride) {
            await fsDeleteFile(filePath);
        } else {
            throw new Error('File exist');
        }
    }
    await _fsWriteFile(filePath, txt);
    return filePath;
}
export async function fsRenameFile(basePath: string,
    oldFileName: string, newFileName: string) {
    const oldFilePath = pathJoin(basePath, oldFileName);
    const newFilePath = pathJoin(basePath, newFileName);
    if (!await fsCheckFileExist(oldFilePath)) {
        throw new Error('File not exist');
    } else if (await fsCheckFileExist(newFilePath)) {
        throw new Error('File exist');
    }
    return _fsRename(oldFilePath, newFilePath);
}
export async function fsDeleteFile(filePath: string) {
    if (await fsCheckDirExist(filePath)) {
        throw new Error(`${filePath} is not a file`);
    }
    if (await fsCheckFileExist(filePath)) {
        await _fsUnlink(filePath);
    }
}
export async function fsDeleteDir(filePath: string) {
    if (await fsCheckFileExist(filePath)) {
        throw new Error(`${filePath} is not a directory`);
    }
    if (await fsCheckDirExist(filePath)) {
        await _fsRmdir(filePath);
    }
}
export function fsReadFile(filePath: string) {
    return _fsReadFile(filePath, 'utf8');
}
export function fsCopyFileToPath(filePath: string,
    fileName: string, destinationPath: string) {
    const targetPath = pathJoin(destinationPath, fileName);
    return _fsCopyFile(filePath, targetPath);
}
