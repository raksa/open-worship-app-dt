import EventHandler from '../event/EventHandler';
import {
    FileMetadataType,
    getFileMetaData,
    MimetypeNameType,
    getAppMimetype,
    fsListFiles,
} from '../server/fileHelper';
import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from './errorHelpers';
import FileSource from './FileSource';
import { getSetting, setSetting } from './settingHelper';

export type DirSourceEventType = 'refresh' | 'reload';

export default class DirSource extends EventHandler<DirSourceEventType> {
    static eventNamePrefix: string = 'dir-source';
    settingName: string;
    static _fileCacheKeys: string[] = [];
    static _cache = new Map<string, DirSource>();
    static _objectId = 0;
    checkExtraFile: ((fileName: string) => FileMetadataType | null) | null = null;
    constructor(settingName: string) {
        super();
        if (!settingName) {
            throw new Error('Invalid setting name');
        }
        this.settingName = settingName;
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
        }) || null;
    }
    fireRefreshEvent() {
        this.addPropEvent('refresh');
    }
    fireReloadEvent() {
        this.addPropEvent('reload');
    }
    async getFileSources(mimetype: MimetypeNameType) {
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
            return matchedFiles.map((fileMetadata) => {
                return FileSource.getInstance(
                    this.dirPath, fileMetadata.fileName);
            });
        } catch (error) {
            handleError(error);
            showSimpleToast('Getting File List',
                'Error occurred during listing file');
            return undefined;
        }
    }
    static getInstance(settingName: string) {
        const cacheKey = this.toCacheKey(settingName);
        if (!this._cache.has(cacheKey)) {
            const dirSource = new DirSource(settingName);
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
