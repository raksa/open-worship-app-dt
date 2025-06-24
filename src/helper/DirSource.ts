import EventHandler from '../event/EventHandler';
import {
    FileMetadataType,
    getFileMetaData,
    MimetypeNameType,
    getAppMimetype,
    fsListFiles,
    fsCheckDirExist,
    pathResolve,
} from '../server/fileHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from './errorHelpers';
import FileSource from './FileSource';
import { getSetting, setSetting } from './settingHelpers';

export type DirSourceEventType = 'reload';

const fileCacheKeys: string[] = [];
const cache = new Map<string, DirSource>();
export default class DirSource extends EventHandler<DirSourceEventType> {
    settingName: string;
    static readonly eventNamePrefix: string = 'dir-source';
    checkExtraFile: ((fName: string) => FileMetadataType | null) | null = null;
    private _isDirPathValid: boolean | null = null;
    constructor(settingName: string) {
        super();
        if (!settingName) {
            throw new Error('Invalid setting name');
        }
        this.settingName = settingName;
    }
    async init() {
        if (!this.dirPath) {
            return;
        }
        const isDirectory =
            !!this.dirPath && (await fsCheckDirExist(this.dirPath));
        this._isDirPathValid = isDirectory;
    }
    get isDirPathValid() {
        return this._isDirPathValid;
    }
    get dirPath() {
        return getSetting(this.settingName, '');
    }
    set dirPath(newDirPath: string) {
        setSetting(this.settingName, newDirPath);
        this.fireReloadEvent();
    }
    static toCacheKey(settingName: string) {
        const cacheKey = `${settingName}-${getSetting(settingName, '')}`;
        fileCacheKeys.push(cacheKey);
        return cacheKey;
    }
    static getCacheKeyByDirPath(dirPath: string) {
        return (
            fileCacheKeys.find((cacheKey) => {
                return cacheKey.includes(dirPath);
            }) ?? null
        );
    }
    getFileSourceInstance(fileFullName: string) {
        return FileSource.getInstance(this.dirPath, fileFullName);
    }
    fireReloadEvent() {
        this.addPropEvent('reload');
    }
    fireReloadFileEvent(fileFullName: string) {
        if (!this.dirPath) {
            return;
        }
        const fileSource = this.getFileSourceInstance(fileFullName);
        fileSource.fireUpdateEvent();
    }

    checkIsSameDirPath(dirPath: string) {
        if (!this.dirPath) {
            return false;
        }
        const resolvedDirPath = pathResolve(this.dirPath);
        const targetResolvedDirPath = pathResolve(dirPath);
        return resolvedDirPath === targetResolvedDirPath;
    }

    async getFilePaths(mimetypeName: MimetypeNameType) {
        if (!this.dirPath) {
            return [];
        }
        try {
            const mimetypeList = getAppMimetype(mimetypeName);
            const files = await fsListFiles(this.dirPath);
            const matchedFiles = files
                .map((fileFullName) => {
                    const fileMetadata = getFileMetaData(
                        fileFullName,
                        mimetypeList,
                    );
                    if (fileMetadata === null && this.checkExtraFile) {
                        return this.checkExtraFile(fileFullName);
                    }
                    return fileMetadata;
                })
                .filter((fileMetadata) => {
                    return fileMetadata !== null;
                });
            const filePaths = matchedFiles.map((fileMetadata) => {
                const fileSource = this.getFileSourceInstance(
                    fileMetadata.fileFullName,
                );
                return fileSource.filePath;
            });
            return filePaths;
        } catch (error) {
            handleError(error);
            showSimpleToast(
                'Getting File List',
                'Error occurred during listing file',
            );
        }
    }
    static async getInstance(settingName: string) {
        const cacheKey = this.toCacheKey(settingName);
        if (!cache.has(cacheKey)) {
            const dirSource = new DirSource(settingName);
            await dirSource.init();
            cache.set(cacheKey, dirSource);
        }
        return cache.get(cacheKey) as DirSource;
    }
    static getInstanceByDirPath(dirPath: string) {
        const cacheKey = this.getCacheKeyByDirPath(dirPath);
        if (cacheKey !== null && cache.has(cacheKey)) {
            return cache.get(cacheKey) as DirSource;
        }
        return null;
    }
}
