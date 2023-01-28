import ToastEventListener from '../event/ToastEventListener';
import SlideItem from '../slide-list/SlideItem';
import DirSource from './DirSource';
import {
    extractExtension,
    fsCheckFileExist,
    fsCreateFile,
    fsDeleteFile,
    fsReadFile,
    fsRenameFile,
    getFileMetaData,
    pathBasename,
    pathJoin,
    pathSeparator,
} from '../server/fileHelper';
import { AnyObjectType, isValidJson } from './helpers';
import ItemSource from './ItemSource';
import { urlPathToFileURL } from '../server/helpers';
import EventHandler from '../event/EventHandler';
import appProvider from '../server/appProvider';
import DragInf, { DragTypeEnum } from './DragInf';

export type SrcData = `data:${string}`;

export type FSEventType = 'select' | 'update'
    | 'history-update' | 'edit' | 'delete'
    | 'delete-cache' | 'refresh-dir';

export default class FileSource extends EventHandler<FSEventType>
    implements DragInf<string> {
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
    getSrcData() {
        return new Promise<SrcData>((resolve, reject) => {
            appProvider.fileUtils.readFile(this.filePath, {
                encoding: 'base64',
            }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                const metadata = this.metadata;
                if (metadata === null) {
                    reject(new Error('metadata not found'));
                    return;
                }
                const mimeType = metadata.appMimetype.mimetype;
                resolve(`data:${mimeType};base64,${data}`);
            });
        });
    }
    get metadata() {
        return getFileMetaData(this.fileName);
    }
    get name() {
        return this.fileName.substring(0,
            this.fileName.lastIndexOf('.'));
    }
    get extension() {
        return extractExtension(this.fileName);
    }
    get dirSource() {
        return DirSource.getInstanceByDirPath(this.basePath);
    }
    fireRefreshDirEvent() {
        this.dirSource?.fireRefreshEvent();
    }
    fireReloadDirEvent() {
        this.dirSource?.fireReloadEvent();
    }
    fireSelectEvent() {
        this.addPropEvent('select');
        FileSource.addPropEvent('select', this);
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
    async readFileToJsonData() {
        try {
            const str = await fsReadFile(this.filePath);
            if (isValidJson(str)) {
                return JSON.parse(str) as AnyObjectType;
            }
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
    static getInstanceNoCache(filePath: string, fileName?: string) {
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
    static getInstance(filePath: string, fileName?: string, refreshCache?: boolean) {
        const fileSource = this.getInstanceNoCache(filePath, fileName);
        if (refreshCache) {
            this._cache.delete(fileSource.filePath);
        }
        if (this._cache.has(fileSource.filePath)) {
            return this._cache.get(fileSource.filePath) as FileSource;
        }
        this._cache.set(fileSource.filePath, fileSource);
        return fileSource;
    }
    dragSerialize(type?: DragTypeEnum) {
        return {
            type: type ?? DragTypeEnum.UNKNOWN,
            data: this.filePath,
        };
    }
    static dragDeserialize(data: any) {
        return this.getInstance(data);
    }
    async renameTo(newName: string) {
        if (newName === this.name) {
            return false;
        }
        try {
            await fsRenameFile(this.basePath, this.fileName,
                newName + this.extension);
            return true;
        } catch (error: any) {
            appProvider.appUtils.handleError(error);
            ToastEventListener.showSimpleToast({
                title: 'Renaming File',
                message: `Unable to rename file: ${error.message}`,
            });
        }
        return false;
    }
    private async _duplicate() {
        let i = 1;
        let newName = this.name + ' (Copy)';
        while (await fsCheckFileExist(
            this.basePath, newName + this.extension)) {
            newName = this.name + ' (Copy ' + i + ')';
            i++;
        }
        const newFilePath = pathJoin(this.basePath, newName + this.extension);
        const data = await this.readFileToJsonData();
        if (data !== null) {
            await fsCreateFile(newFilePath, JSON.stringify(data));
        }
    }
    async duplicate() {
        try {
            await this._duplicate();
            return true;
        } catch (error) {
            ToastEventListener.showSimpleToast({
                title: 'Duplicating File',
                message: 'Unable to duplicate file',
            });
            // TODO: handle error by a function
            appProvider.appUtils.handleError(error);
        }
        return false;
    }
}
