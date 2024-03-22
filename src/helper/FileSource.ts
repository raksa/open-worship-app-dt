import DirSource from './DirSource';
import {
    checkIsAppFile, extractExtension, fsCheckFileExist, fsCreateFile,
    fsDeleteFile, fsReadFile, fsRenameFileInDir, fsWriteFile, getFileMetaData,
    pathBasename, pathJoin, pathSeparator,
} from '../server/fileHelper';
import { AnyObjectType, isValidJsonString } from './helpers';
import ItemSource from './ItemSource';
import { pathToFileURL } from '../server/helpers';
import EventHandler from '../event/EventHandler';
import appProvider from '../server/appProvider';
import DragInf, { DragTypeEnum } from './DragInf';
import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from './errorHelpers';
import FileSourceMetaManager from './FileSourceMetaManager';
import ColorNoteInf from './ColorNoteInf';

export type SrcData = `data:${string}`;

export type FSEventType = 'select' | 'update' | 'history-update' | 'edit'
    | 'delete' | 'delete-cache';

export default class FileSource extends EventHandler<FSEventType>
    implements DragInf<string>, ColorNoteInf {
    static readonly eventNamePrefix: string = 'file-source';
    basePath: string;
    fileName: string;
    filePath: string;
    src: string;
    colorNote: string | null = null;
    private static _cache = new Map<string, FileSource>();
    constructor(
        basePath: string, fileName: string, filePath: string, src: string,
    ) {
        super();
        this.basePath = basePath;
        this.fileName = fileName;
        this.filePath = filePath;
        this.src = src;
    }
    get isAppFile() {
        return !checkIsAppFile(this.fileName);
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
    getColorNote() {
        return FileSourceMetaManager.getColorNote(this.filePath);
    }
    async setColorNote(color: string | null) {
        FileSourceMetaManager.setColorNote(this.filePath, color);
        this.dirSource?.fireReloadEvent();
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
    deleteCache() {
        FileSource._cache.delete(this.filePath);
        ItemSource.deleteCache(this.filePath);
        this.fireDeleteCacheEvent();
    }
    async readFileToJsonData() {
        try {
            const str = await fsReadFile(this.filePath);
            if (isValidJsonString(str)) {
                return JSON.parse(str) as AnyObjectType;
            }
        } catch (error: any) {
            showSimpleToast('Reading File Data', error.message);
        }
        return null;
    }
    async saveData(data: string) {
        try {
            const isFileExist = await fsCheckFileExist(this.filePath);
            if (isFileExist) {
                await fsWriteFile(this.filePath, data);
            } else {
                await fsCreateFile(this.filePath, data, true);
            }
            this.fireUpdateEvent();
            return true;
        } catch (error: any) {
            showSimpleToast('Saving File', error.message);
        }
        return false;
    }
    async delete() {
        try {
            await fsDeleteFile(this.filePath);
            this.fireDeleteEvent();
            this.deleteCache();
            return true;
        } catch (error: any) {
            showSimpleToast('Saving File', error.message);
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
        return new FileSource(
            basePath, fileName, filePath, pathToFileURL(filePath),
        );
    }
    static getInstance(filePath: string, fileName?: string,
        refreshCache?: boolean) {
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
            type: type || DragTypeEnum.UNKNOWN,
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
            await fsRenameFileInDir(this.basePath, this.fileName,
                newName + this.extension);
            return true;
        } catch (error: any) {
            handleError(error);
            showSimpleToast('Renaming File',
                `Unable to rename file: ${error.message}`);
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
        } catch (error) {
            showSimpleToast('Duplicating File', 'Unable to duplicate file');
            handleError(error);
        }
    }
    static registerFSEventListener(
        events: FSEventType[], callback: () => void, filePath?: string,
    ) {
        const newEvents = events.map((event) => {
            return filePath ? `${event}:${filePath}` : event;
        });
        return super.registerEventListener(newEvents, callback);
    }
    static addFSPropEvent(
        eventName: FSEventType, filePath: string, data?: any,
    ): void {
        const newEventName = `${eventName}:${filePath}` as FSEventType;
        super.addPropEvent(eventName, data);
        super.addPropEvent(newEventName, data);
    }
    fireSelectEvent() {
        FileSource.addFSPropEvent('select', this.filePath);
    }
    fireHistoryUpdateEvent() {
        FileSource.addFSPropEvent('history-update', this.filePath);
    }
    fireUpdateEvent() {
        FileSource.addFSPropEvent('update', this.filePath);
    }
    fireDeleteEvent() {
        FileSource.addFSPropEvent('delete', this.filePath);
    }
    fireDeleteCacheEvent() {
        FileSource.addFSPropEvent('delete-cache', this.filePath);
    }
}
