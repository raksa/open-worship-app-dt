import FileSource from '../helper/FileSource';
import { isValidJson } from '../helper/helpers';
import { log } from '../helper/loggerHelpers';
import {
    getSetting, setSetting,
} from '../helper/settingHelper';

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
    filePath: string;
    settingName: string;
    constructor(filePath: string, settingNameSuffix: string) {
        this.filePath = filePath;
        this.settingName = `${SETTING_NAME}-${settingNameSuffix}`;
    }
    get isChanged() {
        return !!this.histories.length;
    }
    get _changes(): ChangesType<T1> {
        const str = getSetting(this.settingName, '');
        if (isValidJson(str, true)) {
            return JSON.parse(str);
        }
        return {};
    }
    set _changes(changes: ChangesType<T1>) {
        if (!this.isUsingHistory) {
            log('Saving is disabled');
            return;
        }
        setSetting(this.settingName, JSON.stringify(changes));
    }
    get _changedObject(): ChangeObjectType<T1> {
        const changes = this._changes;
        const changedObject = changes[this.filePath] || {
            undoQueue: [],
            redoQueue: [],
        };
        changedObject.undoQueue = changedObject.undoQueue || [];
        changedObject.redoQueue = changedObject.redoQueue || [];
        return changedObject;
    }
    set _changedObject(changedObject: ChangeObjectType<T1>) {
        const changesObject = this._changes;
        changesObject[this.filePath] = changedObject;
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
    abstract get presentJson(): T2;
    pushUndo(history: T1) {
        const changedObject = this._changedObject;
        changedObject.undoQueue.push(history);
        changedObject.redoQueue = [];
        this._changedObject = changedObject;
        FileSource.getInstance(this.filePath).fireUpdateEvent();
    }
    popUndo() {
        const changedObject = this._changedObject;
        if (changedObject.undoQueue.length === 0) {
            return null;
        }
        const history = changedObject.undoQueue.pop() as T1;
        changedObject.redoQueue.push(history);
        this._changedObject = changedObject;
        const fileSource = FileSource.getInstance(this.filePath);
        fileSource.fireUpdateEvent();
        fileSource.fireHistoryUpdateEvent();
    }
    popRedo() {
        const changedObject = this._changedObject;
        if (changedObject.redoQueue.length === 0) {
            return null;
        }
        const history = changedObject.redoQueue.pop() as T1;
        changedObject.undoQueue.push(history);
        this._changedObject = changedObject;
        const fileSource = FileSource.getInstance(this.filePath);
        fileSource.fireUpdateEvent();
        fileSource.fireHistoryUpdateEvent();
    }
    delete() {
        const data = this._changes;
        delete data[this.filePath];
        this._changes = data;
        const fileSource = FileSource.getInstance(this.filePath);
        fileSource.fireUpdateEvent();
        fileSource.fireHistoryUpdateEvent();
    }
}
