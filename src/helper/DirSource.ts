import EventHandler from '../event/EventHandler';
import {
    FileMetadataType,
    getFileMetaData,
    MimetypeNameType,
    getAppMimetype,
    fsListFiles,
    fsCheckDirExist,
} from '../server/fileHelper';
import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from './errorHelpers';
import FileSource from './FileSource';
import { getSetting, setSetting } from './settingHelper';

export type DirSourceEventType = 'reload';

export default class DirSource extends EventHandler<DirSourceEventType> {
    settingName: string;
    static eventNamePrefix: string = 'dir-source';
    static _fileCacheKeys: string[] = [];
    static _cache = new Map<string, DirSource>();
    static _objectId = 0;
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
        const isDirectory = await fsCheckDirExist(this.dirPath);
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
        this._fileCacheKeys.push(cacheKey);
        return cacheKey;
    }
    static getCacheKeyByDirPath(dirPath: string) {
        return this._fileCacheKeys.find((cacheKey) => {
            return cacheKey.includes(dirPath);
        }) ?? null;
    }
    getFileSourceInstance(fileName: string) {
        return FileSource.getInstance(this.dirPath, fileName);
    }
    fireReloadEvent() {
        this.addPropEvent('reload');
    }
    fireReloadFileEvent(fileName: string) {
        if (!this.dirPath) {
            return;
        }
        const fileSource = this.getFileSourceInstance(fileName);
        fileSource.fireUpdateEvent();
    }
    async getFilePaths(mimetype: MimetypeNameType) {
        if (!this.dirPath) {
            return [];
        }
        try {
            const mimetypeList = getAppMimetype(mimetype);
            const files = await fsListFiles(this.dirPath);
            const matchedFiles = files.map((fileName) => {
                const fileMetadata = getFileMetaData(fileName, mimetypeList);
                if (fileMetadata === null && this.checkExtraFile) {
                    return this.checkExtraFile(fileName);
                }
                return fileMetadata;
            }).filter((fileMetadata) => {
                return fileMetadata !== null;
            }) as FileMetadataType[];
            const filePaths = matchedFiles.map((fileMetadata) => {
                const fileSource = this.getFileSourceInstance(
                    fileMetadata.fileName,
                );
                return fileSource.filePath;
            });
            return filePaths;
        } catch (error) {
            handleError(error);
            showSimpleToast('Getting File List',
                'Error occurred during listing file');
        }
    }
    static async getInstance(settingName: string) {
        const cacheKey = this.toCacheKey(settingName);
        if (!this._cache.has(cacheKey)) {
            const dirSource = new DirSource(settingName);
            await dirSource.init();
            this._cache.set(cacheKey, dirSource);
        }
        return this._cache.get(cacheKey) as DirSource;
    }
    static getInstanceByDirPath(dirPath: string) {
        const cacheKey = this.getCacheKeyByDirPath(dirPath);
        if (cacheKey !== null && this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey) as DirSource;
        }
        return null;
    }
}
