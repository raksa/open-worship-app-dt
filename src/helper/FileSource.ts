import { useState, useEffect } from 'react';
import ToastEventListener from '../event/ToastEventListener';
import SlideItem from '../slide-list/SlideItem';
import DirSource from './DirSource';
import {
    fsCreateFile,
    fsDeleteFile,
    fsReadFile,
    getFileMetaData,
    pathBasename,
    pathJoin,
    pathSeparator,
} from '../server/fileHelper';
import { AnyObjectType } from './helpers';
import ItemSource from './ItemSource';
import { urlPathToFileURL } from '../server/helpers';
import EventHandler from '../event/EventHandler';

export type FSEventType = 'select' | 'update'
    | 'history-update' | 'edit' | 'delete'
    | 'delete-cache' | 'refresh-dir';

export default class FileSource extends EventHandler<FSEventType> {
    static eventNamePrefix: string = 'file-source';
    basePath: string;
    fileName: string;
    filePath: string;
    src: string;
    static _cache = new Map<string, FileSource>();
    constructor(basePath: string, fileName: string,
        filePath: string, src: string) {
        super();
        this.basePath = basePath;
        this.fileName = fileName;
        this.filePath = filePath;
        this.src = src;
    }
    get metadata() {
        return getFileMetaData(this.fileName);
    }
    get name() {
        return this.fileName.substring(0,
            this.fileName.lastIndexOf('.'));
    }
    get dirSource() {
        return DirSource.getDirSourceByDirPath(this.basePath);
    }
    fireRefreshDirEvent() {
        this.dirSource?.fireRefreshEvent();
    }
    fireReloadDirEvent() {
        this.dirSource?.fireReloadEvent();
    }
    fireSelectEvent() {
        this.addPropEvent('select');
    }
    fireHistoryUpdateEvent() {
        this.addPropEvent('history-update');
    }
    fireUpdateEvent() {
        this.addPropEvent('update');
    }
    fireEditEvent(slideItem: SlideItem) {
        this.addPropEvent('edit', slideItem);
    }
    fireDeleteEvent() {
        this.addPropEvent('delete');
    }
    fireDeleteCacheEvent() {
        this.addPropEvent('delete-cache');
    }
    deleteCache() {
        FileSource._cache.delete(this.filePath);
        ItemSource.deleteCache(this.filePath);
        this.fireDeleteCacheEvent();
    }
    async readFileToData() {
        try {
            const str = await fsReadFile(this.filePath);
            return JSON.parse(str) as AnyObjectType;
        } catch (error: any) {
            ToastEventListener.showSimpleToast({
                title: 'Reading File Data',
                message: error.message,
            });
        }
        return null;
    }
    async saveData(data: ItemSource<any>) {
        try {
            const content = JSON.stringify(data.toJson());
            await fsCreateFile(this.filePath, content, true);
            this.fireUpdateEvent();
            return true;
        } catch (error: any) {
            ToastEventListener.showSimpleToast({
                title: 'Saving File',
                message: error.message,
            });
        }
        return false;
    }
    async delete() {
        try {
            await fsDeleteFile(this.filePath);
            this.fireDeleteEvent();
            this.deleteCache();
            this.fireReloadDirEvent();
            return true;
        } catch (error: any) {
            ToastEventListener.showSimpleToast({
                title: 'Saving File',
                message: error.message,
            });
        }
        return false;
    }
    static genFileSourceNoCache(filePath: string, fileName?: string) {
        let basePath;
        if (fileName) {
            basePath = filePath;
            filePath = pathJoin(filePath, fileName);
        } else {
            const index = filePath.lastIndexOf(pathSeparator);
            basePath = filePath.substring(0, index);
            fileName = pathBasename(filePath);
        }
        return new FileSource(basePath, fileName, filePath,
            urlPathToFileURL(filePath).toString());
    }
    static genFileSource(filePath: string, fileName?: string, refreshCache?: boolean) {
        const fileSource = this.genFileSourceNoCache(filePath, fileName);
        if (refreshCache) {
            this._cache.delete(fileSource.filePath);
        }
        if (this._cache.has(fileSource.filePath)) {
            return this._cache.get(fileSource.filePath) as FileSource;
        }
        this._cache.set(fileSource.filePath, fileSource);
        return fileSource;
    }
}

export function useFSEvents(events: FSEventType[], fileSource: FileSource | null,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useEffect(() => {
        if (fileSource === null) {
            return;
        }
        const registerEvent = fileSource.registerEventListener(
            events, () => {
                setN(n + 1);
                callback?.();
            });
        return () => {
            fileSource.unregisterEventListener(registerEvent);
        };
    }, [fileSource, n]);
}
