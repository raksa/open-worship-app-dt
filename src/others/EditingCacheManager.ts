import FileSource from '../helper/FileSource';
import {
    getSetting, setSetting,
} from '../helper/settingHelper';
import { cloneObject } from '../helper/helpers';

type ChangeObjectType<T> = {
    undoQueue: T[],
    redoQueue: T[],
};
type ChangesType<T> = {
    [key: string]: ChangeObjectType<T> | undefined
};

const SETTING_NAME = 'editing-cache';
export default abstract class EditingCacheManager<T1, T2> {
    isUsingHistory = true;
    fileSource: FileSource;
    settingName: string;
    constructor(fileSource: FileSource, settingNameSuffix: string) {
        this.fileSource = fileSource;
        this.settingName = `${SETTING_NAME}-${settingNameSuffix}`;
    }
    get isChanged() {
        return !!this.histories.length;
    }
    get _changes(): ChangesType<T1> {
        const str = getSetting(this.settingName, '{}');
        try {
            return JSON.parse(str);
        } catch (error) {
            console.log(error);
            return {};
        }
    }
    set _changes(changes: ChangesType<T1>) {
        if (!this.isUsingHistory) {
            console.log('Saving is disabled');
            return;
        }
        setSetting(this.settingName, JSON.stringify(changes));
    }
    get _changedObject(): ChangeObjectType<T1> {
        const changes = this._changes;
        const changedObject = changes[this.fileSource.filePath] || {
            undoQueue: [],
            redoQueue: [],
        };
        changedObject.undoQueue = changedObject.undoQueue || [];
        changedObject.redoQueue = changedObject.redoQueue || [];
        return changedObject;
    }
    set _changedObject(changedObject: ChangeObjectType<T1>) {
        const changesObject = this._changes;
        changesObject[this.fileSource.filePath] = changedObject;
        this._changes = changesObject;
    }
    get histories(): T1[] {
        const changedObject = this._changedObject;
        return changedObject.undoQueue.concat(changedObject.redoQueue);
    }
    get undoQueue(): T1[] {
        const changedObject = this._changedObject;
        return changedObject.undoQueue;
    }
    get redoQueue(): T1[] {
        const changedObject = this._changedObject;
        return changedObject.redoQueue;
    }
    abstract get latestHistory(): T2;
    pushUndo(history: T1) {
        const changedObject = this._changedObject;
        changedObject.undoQueue.push(history);
        changedObject.redoQueue = [];
        this._changedObject = changedObject;
        this.fileSource.fireUpdateEvent();
    }
    popUndo() {
        const changedObject = this._changedObject;
        if (changedObject.undoQueue.length === 0) {
            return null;
        }
        const history = changedObject.undoQueue.pop() as T1;
        changedObject.redoQueue.push(history);
        this._changedObject = changedObject;
        this.fileSource.fireUpdateEvent();
    }
    popRedo() {
        const changedObject = this._changedObject;
        if (changedObject.redoQueue.length === 0) {
            return null;
        }
        const history = changedObject.redoQueue.pop() as T1;
        changedObject.undoQueue.push(history);
        this._changedObject = changedObject;
        this.fileSource.fireUpdateEvent();
    }
    delete() {
        const data = this._changes;
        delete data[this.fileSource.filePath];
        this._changes = data;
    }
}
