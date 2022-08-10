import ToastEventListener from '../event/ToastEventListener';
import appProvider from './appProvider';
import FileSource from '../helper/FileSource';

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

export const pathSeparator = appProvider.pathUtils.sep;
export function pathJoin(filePath: string, fileName: string) {
    return appProvider.pathUtils.join(filePath, fileName);
}
export function pathBasename(filePath: string) {
    return appProvider.pathUtils.basename(filePath);
}

export const createNewItem = async (dir: string, name: string,
    content: string, mimetype: MimetypeNameType) => {
    // TODO: verify file name before create
    const mimetypeList = getAppMimetype(mimetype);
    const fileName = `${name}${mimetypeList[0].extensions[0]}`;
    try {
        const filePath = pathJoin(dir, fileName);
        return await fsCreateFile(filePath,
            content);
    } catch (error: any) {
        ToastEventListener.showSimpleToast({
            title: 'Creating Playlist',
            message: error.message,
        });
    }
    return null;
};

export const mimetypeNameTypeList = [
    'image', 'video', 'slide',
    'playlist', 'lyric', 'bible',
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
    const json = require(`./mime/${mimetype}-types.json`);
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
export function isSupportedExt(fileName: string,
    mimetype: MimetypeNameType) {
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

export function fsListFiles(dir: string) {
    return new Promise<string[]>((resolve, reject) => {
        if (!dir) {
            return resolve([]);
        }
        appProvider.fileUtils.readdir(dir, (error, list) => {
            if (error) {
                console.log(error);
                return reject(new Error('Error occurred during listing file'));
            }
            resolve(list);
        });
    });
}

export async function fsListFilesWithMimetype(dir: string, mimetype: MimetypeNameType) {
    if (!dir) {
        return [];
    }
    try {
        const mimetypeList = require(`./mime/${mimetype}-types.json`) as AppMimetypeType[];
        const files = await fsListFiles(dir);
        const matchedFiles = files.map((fileName) => {
            return getFileMetaData(fileName, mimetypeList);
        }).filter((d) => {
            return !!d;
        }) as FileMetadataType[];
        return matchedFiles.map((fileMetadata) => {
            return FileSource.getInstance(dir, fileMetadata.fileName);
        });
    } catch (error) {
        console.log(error);
        ToastEventListener.showSimpleToast({
            title: 'Getting File List',
            message: 'Error occurred during listing file',
        });
    }
    return null;
}

export function fsCheckFileExist(filePath: string, fileName?: string) {
    return new Promise<boolean>((resolve, reject) => {
        if (fileName) {
            filePath = pathJoin(filePath, fileName);
        }
        appProvider.fileUtils.stat(filePath, (error) => {
            if (error === null) {
                resolve(true);
            } else if (error.code === 'ENOENT') {
                resolve(false);
            } else {
                console.log(error);
                reject(new Error('Error during checking file exist'));
            }
        });
    });
}
export async function fsCreateDir(dirPath: string) {
    try {
        appProvider.fileUtils.mkdirSync(dirPath);
    } catch (error: any) {
        if (!error.message.includes('file already exists')) {
            return error;
        }
    }
}
export async function fsWhiteFile(filePath: string, txt: string) {
    try {
        if (!await fsCheckFileExist(filePath)) {
            appProvider.fileUtils.writeFileSync(filePath, txt, {
                encoding: 'utf8', flag: 'w',
            });
            return filePath;
        } else {
            throw new Error('File exist');
        }
    } catch (error) {
        console.log(error);
        throw new Error('Error occurred during creating file');
    }
}
export async function fsCreateFile(filePath: string,
    txt: string, isOverride?: boolean) {
    try {
        if (await fsCheckFileExist(filePath)) {
            if (isOverride) {
                await fsDeleteFile(filePath);
            } else {
                throw new Error('File exist');
            }
        }
        appProvider.fileUtils.writeFileSync(filePath, txt);
        return filePath;
    } catch (error) {
        console.log(error);
        throw new Error('Error occurred during creating file');
    }
}
export async function fsRenameFile(basePath: string,
    oldFileName: string, newFileName: string) {
    try {
        const oldFilePath = pathJoin(basePath, oldFileName);
        const newFilePath = pathJoin(basePath, newFileName);
        appProvider.fileUtils.renameSync(oldFilePath, newFilePath);
    } catch (error) {
        console.log(error);
        throw new Error('Error occurred during renaming file');
    }
}
export async function fsDeleteFile(filePath: string) {
    try {
        if (await fsCheckFileExist(filePath)) {
            appProvider.fileUtils.unlinkSync(filePath);
        }
    } catch (error) {
        console.log(error);
        throw new Error('Error occurred during deleting file');
    }
}
export async function fsReadFile(filePath: string) {
    try {
        return appProvider.fileUtils.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.log(error);
        throw new Error('Error occurred during reading file');
    }
}
export async function fsCopyFileToPath(filePath: string,
    fileName: string, destinationPath: string) {
    try {
        const targetPath = pathJoin(destinationPath, fileName);
        appProvider.fileUtils.copyFileSync(filePath, targetPath);
    } catch (error) {
        console.log(error);
        throw new Error('Error occurred during copying file');
    }
}
