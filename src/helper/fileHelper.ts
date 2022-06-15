import { toastEventListener } from '../event/ToastEventListener';
import appProvider from './appProvider';

type MimeType = {
    type: string,
    title: string,
    mimeType: string,
    extension: string[],
};

type FileMetadataType = { fileName: string, mimeType: MimeType };


export class FileSource {
    basePath: string;
    fileName: string;
    filePath: string;
    src: string;
    constructor(basePath: string, fileName: string,
        filePath: string, src: string,) {
        this.basePath = basePath;
        this.fileName = fileName;
        this.filePath = filePath;
        this.src = src;
    }
    get name() {
        return this.fileName.substring(0, this.fileName.lastIndexOf('.'));
    }
    async readFileToData<T>(validator: (json: any) => boolean) {
        const str = await fileHelpers.readFile(this.filePath);
        if (str !== null) {
            const json = JSON.parse(str);
            if (validator(json)) {
                return json as T;
            }
        }
        return null;
    }
    async saveData(data: Object) {
        try {
            const content = JSON.stringify(data);
            await fileHelpers.overWriteFile(this.filePath, content);
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Saving File',
                message: error.message,
            });
        }
        return false;
    }
}

export type MimetypeNameType = 'image' | 'video' | 'slide' | 'playlist' | 'lyric';

function getFileMetaData(fileName: string, mimeTypes: MimeType[]): FileMetadataType | null {
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const foundMT = mimeTypes.find((mt) => ~mt.extension.indexOf(ext));
    if (foundMT) {
        return { fileName, mimeType: foundMT };
    }
    return null;
}

export function getAppMimetype(mt: MimetypeNameType) {
    return require(`./mime/${mt}-types.json`) as MimeType[];
}

export function isSupportedMimetype(fileMimetype: string, mt: MimetypeNameType) {
    const mimeTypes = getAppMimetype(mt);
    return mimeTypes.map((mimeType) => mimeType.mimeType).some((type) => type === fileMimetype);
}

export function genFileSource(filePath: string, fileName?: string): FileSource {
    let basePath;
    if (fileName) {
        basePath = filePath;
        filePath = appProvider.path.join(filePath, fileName);
    } else {
        const index = filePath.lastIndexOf(appProvider.path.sep);
        basePath = filePath.substring(0, index);
        fileName = appProvider.path.basename(filePath);
    }
    return new FileSource(basePath, fileName, filePath,
        appProvider.url.pathToFileURL(filePath).toString());
}

const fileHelpers = {
    createWriteStream: function (filePath: string) {
        return appProvider.fs.createWriteStream(filePath);
    },
    listFiles: async function (dir: string, type: MimetypeNameType) {
        if (!dir) {
            return [];
        }
        try {
            const mimeTypes = require(`./mime/${type}-types.json`) as MimeType[];
            const files = appProvider.fs.readdirSync(dir);
            const matchedFiles = files.map((fileName) => getFileMetaData(fileName, mimeTypes))
                .filter((d) => !!d) as FileMetadataType[];
            return matchedFiles.map((fileMetadata) => genFileSource(dir, fileMetadata.fileName));
        } catch (error) {
            console.log(error);
            throw new Error('Error occurred during listing file');
        }
    },
    checkFileExist: async function (filePath: string, fileName?: string) {
        if (fileName) {
            const newFilePath = appProvider.path.join(filePath, fileName);
            return !!appProvider.fs.existsSync(newFilePath);
        }
        return !!appProvider.fs.existsSync(filePath);
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
    createFile: async function (txt: string, basePath: string, fileName?: string) {
        try {
            const filePath = fileName ? appProvider.path.join(basePath, fileName) : basePath;
            if (!await this.checkFileExist(filePath)) {
                appProvider.fs.writeFileSync(filePath, txt);
                return filePath;
            } else {
                throw new Error('File exist');
            }
        } catch (error) {
            console.log(error);
            throw new Error('Error occurred during creating file');
        }
    },
    overWriteFile: async function (filePath: string, txt: string) {
        await this.deleteFile(filePath);
        return this.createFile(txt, filePath);
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
