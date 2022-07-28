import {
    toastEventListener,
} from '../event/ToastEventListener';
import appProvider from './appProvider';
import FileSource from './FileSource';
import { anyObjectType } from './helpers';

export type AppMimetypeType = {
    type: string,
    title: string,
    mimetype: string,
    mimetypeName: MimetypeNameType,
    extension: string[],
};

export type FileMetadataType = {
    fileName: string,
    appMimetype: AppMimetypeType,
};

export interface ItemSourceInf<T> {
    fileSource: FileSource;
    metadata: anyObjectType,
    content: T;
    toJson: () => Object;
}
export const createNewItem = async (dir: string, name: string,
    content: string, mimetype: MimetypeNameType) => {
    // TODO: verify file name before create
    const mimetypeList = getAppMimetype(mimetype);
    const fileName = `${name}${mimetypeList[0].extension[0]}`;
    try {
        return await fileHelpers.createFile(appProvider.path.join(dir, fileName),
            content);
    } catch (error: any) {
        toastEventListener.showSimpleToast({
            title: 'Creating Playlist',
            message: error.message,
        });
    }
    return null;
};

export type MimetypeNameType = 'image' | 'video' | 'slide' | 'playlist' | 'lyric' | 'bible';

export function getFileMetaData(fileName: string,
    mimetypeList?: AppMimetypeType[]): FileMetadataType | null {
    mimetypeList = mimetypeList || getAllAppMimetype();
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const foundMT = mimetypeList.find((mt) => {
        return ~mt.extension.indexOf(ext);
    });
    if (foundMT) {
        return { fileName, appMimetype: foundMT };
    }
    return null;
}

export function getAllAppMimetype() {
    const mimetypeNames: MimetypeNameType[] = ['image', 'video',
        'slide', 'playlist', 'lyric', 'bible'];
    return mimetypeNames.map((mimetypeName) => {
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
        r.push(...imageType.extension);
        return r;
    }, []).map((ext) => {
        return ext.replace('.', '');
    });
}

export function isSupportedMimetype(fileMimetype: string,
    mimetype: MimetypeNameType) {
    const mimetypeList = getAppMimetype(mimetype);
    return mimetypeList.map((mimetype) => {
        return mimetype.mimetype;
    }).some((type) => {
        return type === fileMimetype;
    });
}

const fileHelpers = {
    createWriteStream: function (filePath: string) {
        return appProvider.fs.createWriteStream(filePath);
    },
    listFiles: function (dir: string) {
        return new Promise<string[]>((resolve, reject) => {
            if (!dir) {
                return resolve([]);
            }
            appProvider.fs.readdir(dir, (error, list) => {
                if (error) {
                    console.log(error);
                    return reject(new Error('Error occurred during listing file'));
                }
                resolve(list);
            });
        });
    },
    listFilesWithMimetype: async function (dir: string, mimetype: MimetypeNameType) {
        if (!dir) {
            return [];
        }
        try {
            const mimetypeList = require(`./mime/${mimetype}-types.json`) as AppMimetypeType[];
            const files = await this.listFiles(dir);
            const matchedFiles = files.map((fileName) => {
                return getFileMetaData(fileName, mimetypeList);
            }).filter((d) => {
                return !!d;
            }) as FileMetadataType[];
            return matchedFiles.map((fileMetadata) => {
                return FileSource.genFileSource(dir, fileMetadata.fileName);
            });
        } catch (error) {
            console.log(error);
            toastEventListener.showSimpleToast({
                title: 'Getting File List',
                message: 'Error occurred during listing file',
            });
        }
        return null;
    },
    checkFileExist: function (filePath: string, fileName?: string) {
        return new Promise<boolean>((resolve, reject) => {
            if (fileName) {
                filePath = appProvider.path.join(filePath, fileName);
            }
            appProvider.fs.stat(filePath, (error) => {
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
    },
    createDir: async function (dirPath: string) {
        try {
            appProvider.fs.mkdirSync(dirPath);
        } catch (error: any) {
            if (!~error.message.indexOf('file already exists')) {
                return error;
            }
        }
    },
    whiteFile: async function (filePath: string, txt: string) {
        try {
            if (!await this.checkFileExist(filePath)) {
                appProvider.fs.writeFileSync(filePath, txt, {
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
    },
    createFile: async function (filePath: string, txt: string, isOverride?: boolean) {
        try {
            if (await this.checkFileExist(filePath)) {
                if (isOverride) {
                    await this.deleteFile(filePath);
                } else {
                    throw new Error('File exist');
                }
            }
            appProvider.fs.writeFileSync(filePath, txt);
            return filePath;
        } catch (error) {
            console.log(error);
            throw new Error('Error occurred during creating file');
        }
    },
    renameFile: async function (basePath: string, oldFileName: string, newFileName: string) {
        try {
            const oldFilePath = appProvider.path.join(basePath, oldFileName);
            const newFilePath = appProvider.path.join(basePath, newFileName);
            appProvider.fs.renameSync(oldFilePath, newFilePath);
        } catch (error) {
            console.log(error);
            throw new Error('Error occurred during renaming file');
        }
    },
    deleteFile: async function (filePath: string) {
        try {
            if (await this.checkFileExist(filePath)) {
                appProvider.fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.log(error);
            throw new Error('Error occurred during deleting file');
        }
    },
    readFile: async function (filePath: string) {
        try {
            return appProvider.fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.log(error);
            throw new Error('Error occurred during reading file');
        }
    },
    copyFileToPath: async function (filePath: string, fileName: string, destinationPath: string) {
        try {
            appProvider.fs.copyFileSync(filePath, appProvider.path.join(destinationPath, fileName));
        } catch (error) {
            console.log(error);
            throw new Error('Error occurred during copying file');
        }
    },
};
export default fileHelpers;
