import appProvider from './appProvider';
import { setSlideFilePathSetting } from './settingHelper';

type MimeType = {
    type: string,
    title: string,
    mimeType: string,
    extension: string[],
};

type FileMetadataType = { fileName: string, mimeType: MimeType };

function getFileMetaData(fileName: string, mimeTypes: MimeType[]): FileMetadataType | null {
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const foundMT = mimeTypes.find((mt) => ~mt.extension.indexOf(ext));
    if (foundMT) {
        return { fileName, mimeType: foundMT };
    }
    return null;
}

export type FileSourceType = {
    basePath: string,
    fileName: string,
    filePath: string,
    src: string,
}

export type MimetypeNameType = 'image' | 'video' | 'slide' | 'playlist';

export function getAppMimetype(mt: MimetypeNameType) {
    return require(`./mime/${mt}-types.json`) as MimeType[];
}

export function isSupportedMimetype(fileMimetype: string, mt: MimetypeNameType) {
    const mimeTypes = getAppMimetype(mt);
    return mimeTypes.map((mimeType) => mimeType.mimeType).some((type) => type === fileMimetype);
}

export function genFileSource(basePath: string, fileName: string) {
    const filePath = appProvider.path.join(basePath, fileName);
    return {
        basePath,
        fileName: fileName,
        filePath,
        src: appProvider.url.pathToFileURL(filePath).toString(),
    };
}

export function listFiles(dir: string, type: MimetypeNameType) {
    try {
        const mimeTypes = require(`./mime/${type}-types.json`) as MimeType[];
        const files = appProvider.fs.readdirSync(dir);
        const matchedFiles = files.map((fileName) => getFileMetaData(fileName, mimeTypes))
            .filter((d) => !!d) as FileMetadataType[];
        return matchedFiles.map((fileMetadata) => genFileSource(dir, fileMetadata.fileName));
    } catch (error) { }
    return null;
}

export function checkFileExist(filePath: string, fileName?: string) {
    if (fileName) {
        return !!appProvider.fs.existsSync(filePath);
    }
    return !!appProvider.fs.existsSync(filePath);
}

export function createFile(txt: string, basePath: string, fileName?: string) {
    try {
        const filePath = fileName ? appProvider.path.join(basePath, fileName) : basePath;
        if (!checkFileExist(filePath)) {
            appProvider.fs.writeFileSync(filePath, txt);
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function renameFile(basePath: string, oldFileName: string, newFileName: string) {
    try {
        const oldFilePath = appProvider.path.join(basePath, oldFileName);
        const newFilePath = appProvider.path.join(basePath, newFileName);
        appProvider.fs.renameSync(oldFilePath, newFilePath);
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function deleteFile(filePath: string) {
    try {
        appProvider.fs.unlinkSync(filePath);
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function readFile(filePath: string) {
    try {
        return appProvider.fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.log(error);
        setSlideFilePathSetting('');
    }
    return null;
}

export function copyFileToPath(filePath: string, fileName: string, destinationPath: string) {
    try {
        appProvider.fs.copyFileSync(filePath, appProvider.path.join(destinationPath, fileName));
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}
