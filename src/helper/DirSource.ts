import EventHandler from '../event/EventHandler';
import ToastEventListener from '../event/ToastEventListener';
import { FileListType } from '../others/FileListHandler';
import {
    FileMetadataType,
    getFileMetaData,
    MimetypeNameType,
    getAppMimetype,
    fsListFiles,
} from '../server/fileHelper';
import FileSource from './FileSource';
import { getSetting, setSetting } from './settingHelper';

type FSEventType = 'refresh' | 'reload';

export default class DirSource extends EventHandler<string> {
    static eventNamePrefix: string = 'dir-source';
    fileSources: FileListType = null;
    settingName: string;
    static _fileCacheKeys: string[] = [];
    static _cache = new Map<string, DirSource>();
    static _objectId = 0;
    constructor(settingName: string) {
        super();
        if (!settingName) {
            throw new Error('Invalid setting name');
        }
        this.settingName = settingName;
    }
    toEventKey(fsType: FSEventType) {
        return `${fsType}-${this.settingName}`;
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
        return this._fileCacheKeys.find((cacheKey) => cacheKey.includes(dirPath)) || null;
    }
    fireRefreshEvent() {
        this.addPropEvent(this.toEventKey('refresh'));
    }
    fireReloadEvent() {
        this.addPropEvent(this.toEventKey('reload'));
    }
    deleteCache() {
        if (this.fileSources) {
            while (this.fileSources.length) {
                this.fileSources.pop()?.deleteCache();
            }
        }
        DirSource._cache.delete(this.dirPath);
    }
    async listFiles(mimetype: MimetypeNameType) {
        if (!this.dirPath) {
            this.fileSources = [];
            return;
        }
        try {
            const mimetypeList = getAppMimetype(mimetype);
            const files = await fsListFiles(this.dirPath);
            const matchedFiles = files.map((fileName) => {
                return getFileMetaData(fileName, mimetypeList);
            }).filter((d) => {
                return !!d;
            }) as FileMetadataType[];
            this.fileSources = matchedFiles.map((fileMetadata) => {
                return FileSource.genFileSource(this.dirPath, fileMetadata.fileName);
            });
        } catch (error) {
            console.log(error);
            ToastEventListener.showSimpleToast({
                title: 'Getting File List',
                message: 'Error occurred during listing file',
            });
            this.fileSources = undefined;
        }
    }
    static genDirSourceNoCache(settingName: string) {
        return new DirSource(settingName);
    }
    static genDirSource(settingName: string, refreshCache?: boolean) {
        const cacheKey = this.toCacheKey(settingName);
        if (refreshCache) {
            this._cache.delete(cacheKey);
        }
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey) as DirSource;
        }
        const dirSource = this.genDirSourceNoCache(settingName);
        this._cache.set(cacheKey, dirSource);
        return dirSource;
    }
    static getDirSourceByDirPath(dirPath: string) {
        const cacheKey = this.getCacheKeyByDirPath(dirPath);
        if (cacheKey !== null && this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey) as DirSource;
        }
        return null;
    }
}
