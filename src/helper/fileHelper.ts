import electronProvider from './appProvider';
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

export function listFiles(dir: string, type: MimetypeNameType) {
    try {
        const mimeTypes = require(`./mime/${type}-types.json`) as MimeType[];
        const files = electronProvider.fs.readdirSync(dir);
        const matchedFiles = files.map((fileName) => getFileMetaData(fileName, mimeTypes))
            .filter((d) => !!d) as FileMetadataType[];
        return matchedFiles.map((fileMetadata) => {
            const filePath = electronProvider.path.join(dir, fileMetadata.fileName);
            return {
                fileName: fileMetadata.fileName,
                filePath,
                src: electronProvider.url.pathToFileURL(filePath).toString(),
            };
        });
    } catch (error) { }
    return null;
}

export function createFile(txt: string, basePath: string, fileName?: string) {
    try {
        const filePath = fileName ? electronProvider.path.join(basePath, fileName) : basePath;
        if (!electronProvider.fs.existsSync(filePath)) {
            electronProvider.fs.writeFileSync(filePath, txt);
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function deleteFile(filePath: string) {
    try {
        electronProvider.fs.unlinkSync(filePath);
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function readFile(filePath: string) {
    try {
        return electronProvider.fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.log(error);
        setSlideFilePathSetting('');
    }
    return null;
}

export function copyFileToPath(filePath: string, fileName: string, destinationPath: string) {
    try {
        electronProvider.fs.copyFileSync(filePath, electronProvider.path.join(destinationPath, fileName));
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}
