import EventHandler from '../event/EventHandler';
import { toastEventListener } from '../event/ToastEventListener';
import { FileListType } from '../others/FileListHandler';
import fileHelpers, {
    FileMetadataType,
    getFileMetaData,
    MimeType,
    MimetypeNameType,
} from './fileHelper';
import FileSource from './FileSource';
import { setSetting } from './settingHelper';

type FSListener = (t: FSEventType) => void;
type FSEventType = 'update';
export type RegisteredEventType = {
    key: string,
    listener: (t: FSEventType) => void,
}
const eventHandler = new EventHandler();
export default class DirSource {
    _dirPath: string;
    fileSources: FileListType = null;
    settingName: string | null = null;
    static _fileCache: Map<string, DirSource> = new Map();
    static _objectId = 0;
    _objectId: number;
    constructor(dirPath: string) {
        this._dirPath = dirPath;
        this._objectId = DirSource._objectId++;
    }
    get dirPath() {
        return this._dirPath;
    }
    set dirPath(newDirPath: string) {
        this._dirPath = newDirPath;
        if (this.settingName !== null) {
            setSetting(this.settingName, this._dirPath);
        }
        this.clearFileSources();
    }
    registerEventListener(fsTypes: FSEventType[],
        listener: FSListener): RegisteredEventType[] {
        return fsTypes.map((fsType) => {
            const key = `${fsType}-${this.dirPath}`;
            eventHandler._addOnEventListener(key, listener);
            return {
                key,
                listener,
            };
        });
    }
    unregisterEventListener(events: RegisteredEventType[]) {
        events.forEach(({ key, listener }) => {
            eventHandler._removeOnEventListener(key, listener);
        });
    }
    update() {
        const key = `update-${this.dirPath}`;
        eventHandler._addPropEvent(key);
    }
    delete() {
        DirSource._fileCache.delete(this.dirPath);
        this.update();
    }
    clearFileSources() {
        this.fileSources = null;
        this.update();
    }
    async listFiles(mimetype: MimetypeNameType) {
        if (!this.dirPath) {
            this.fileSources = [];
            return;
        }
        try {
            const mimeTypes = require(`./mime/${mimetype}-types.json`) as MimeType[];
            const files = await fileHelpers.listFiles(this.dirPath);
            const matchedFiles = files.map((fileName) => {
                return getFileMetaData(fileName, mimeTypes);
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
    static genDirSourceNoCache(dirPath: string) {
        return new DirSource(dirPath);
    }
    static genDirSource(dirPath: string, refreshCache?: boolean) {
        if (refreshCache) {
            this._fileCache.delete(dirPath);
        }
        const fileSource = this.genDirSourceNoCache(dirPath);
        if (this._fileCache.has(dirPath)) {
            return this._fileCache.get(dirPath) as DirSource;
        }
        this._fileCache.set(dirPath, fileSource);
        return fileSource;
    }
}
