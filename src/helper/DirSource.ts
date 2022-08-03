import { globalEventHandler } from '../event/EventHandler';
import { toastEventListener } from '../event/ToastEventListener';
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

type FSListener = (t: FSEventType) => void;
type FSEventType = 'refresh' | 'reload';
export type RegisteredEventType = {
    key: string,
    listener: (t: FSEventType) => void,
}
export default class DirSource {
    fileSources: FileListType = null;
    settingName: string;
    static _fileCacheKeys: string[] = [];
    static _fileCache = new Map<string, DirSource>();
    static _objectId = 0;
    _objectId: number;
    constructor(settingName: string) {
        if (!settingName) {
            throw new Error('Invalid setting name');
        }
        this.settingName = settingName;
        this._objectId = DirSource._objectId++;
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
    registerEventListener(fsTypes: FSEventType[],
        listener: FSListener): RegisteredEventType[] {
        return fsTypes.map((fsType) => {
            const key = this.toEventKey(fsType);
            globalEventHandler._addOnEventListener(key, listener);
            return {
                key,
                listener,
            };
        });
    }
    unregisterEventListener(events: RegisteredEventType[]) {
        events.forEach(({ key, listener }) => {
            globalEventHandler._removeOnEventListener(key, listener);
        });
    }
    fireRefreshEvent() {
        globalEventHandler._addPropEvent(this.toEventKey('refresh'));
    }
    fireReloadEvent() {
        globalEventHandler._addPropEvent(this.toEventKey('reload'));
    }
    deleteCache() {
        if (this.fileSources) {
            while (this.fileSources.length) {
                this.fileSources.pop()?.deleteCache();
            }
        }
        DirSource._fileCache.delete(this.dirPath);
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
            toastEventListener.showSimpleToast({
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
            this._fileCache.delete(cacheKey);
        }
        if (this._fileCache.has(cacheKey)) {
            return this._fileCache.get(cacheKey) as DirSource;
        }
        const dirSource = this.genDirSourceNoCache(settingName);
        this._fileCache.set(cacheKey, dirSource);
        return dirSource;
    }
    static getDirSourceByDirPath(dirPath: string) {
        const cacheKey = this.getCacheKeyByDirPath(dirPath);
        if (cacheKey !== null && this._fileCache.has(cacheKey)) {
            return this._fileCache.get(cacheKey) as DirSource;
        }
        return null;
    }
}
