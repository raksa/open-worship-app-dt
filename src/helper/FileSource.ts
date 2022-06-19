import { globalEventHandler } from '../event/EventHandler';
import {
    toastEventListener,
} from '../event/ToastEventListener';
import appProvider from './appProvider';
import DirSource from './DirSource';
import fileHelpers, {
    MetaDataType,
} from './fileHelper';
import ItemSource from './ItemSource';

type FSListener = (t: FSEventType) => void;
type FSEventType = 'select' | 'update' | 'delete';
export type RegisteredEventType = {
    key: string,
    listener: (t: FSEventType) => void,
}
export default class FileSource {
    basePath: string;
    fileName: string;
    filePath: string;
    src: string;
    static _fileCache: Map<string, FileSource> = new Map();
    constructor(basePath: string, fileName: string,
        filePath: string, src: string) {
        this.basePath = basePath;
        this.fileName = fileName;
        this.filePath = filePath;
        this.src = src;
    }
    toEventKey(fsType: FSEventType) {
        return `${fsType}-${this.filePath}`;
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
        events.forEach(({ key: key, listener }) => {
            globalEventHandler._removeOnEventListener(key, listener);
        });
    }
    get name() {
        return this.fileName.substring(0, this.fileName.lastIndexOf('.'));
    }
    get dirSource() {
        return DirSource.genDirSource(this.basePath);
    }
    refreshDir() {
        this.dirSource.clearFileSources();
    }
    select() {
        globalEventHandler._addPropEvent(this.toEventKey('select'));
    }
    async readFileToData(validator: (json: any) => boolean) {
        try {
            const str = await fileHelpers.readFile(this.filePath);
            if (str !== null) {
                const json = JSON.parse(str);
                if (validator(json)) {
                    return {
                        metadata: json.metadata as MetaDataType,
                        content: json.content,
                    };
                }
                return undefined;
            }
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Reading File Data',
                message: error.message,
            });
        }
        return null;
    }
    async saveData(data: ItemSource<any>) {
        try {
            const content = JSON.stringify(data.toJson());
            await fileHelpers.overWriteFile(this.filePath, content);
            globalEventHandler._addPropEvent(this.toEventKey('update'));
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Saving File',
                message: error.message,
            });
        }
        return false;
    }
    async delete() {
        try {
            await fileHelpers.deleteFile(this.filePath);
            FileSource._fileCache.delete(this.filePath);
            this.refreshDir();
            globalEventHandler._addPropEvent(this.toEventKey('delete'));
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
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
            filePath = appProvider.path.join(filePath, fileName);
        } else {
            const index = filePath.lastIndexOf(appProvider.path.sep);
            basePath = filePath.substring(0, index);
            fileName = appProvider.path.basename(filePath);
        }
        return new FileSource(basePath, fileName, filePath,
            appProvider.url.pathToFileURL(filePath).toString());
    }
    static genFileSource(filePath: string, fileName?: string, refreshCache?: boolean) {
        const fileSource = this.genFileSourceNoCache(filePath, fileName);
        if (refreshCache) {
            this._fileCache.delete(fileSource.filePath);
        }
        if (this._fileCache.has(fileSource.filePath)) {
            return this._fileCache.get(fileSource.filePath) as FileSource;
        }
        this._fileCache.set(fileSource.filePath, fileSource);
        return fileSource;
    }
}
