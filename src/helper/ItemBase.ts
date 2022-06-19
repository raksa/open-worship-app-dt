import FileSource from '../helper/FileSource';
import { setSetting, getSetting } from '../helper/settingHelper';
import ColorNorteInf from './ColorNorteInf';
import { MetaDataType } from './fileHelper';

export abstract class ItemBase implements ColorNorteInf {
    abstract id: number;
    abstract fileSource?: FileSource | null;
    abstract metadata?: MetaDataType;
    static SELECT_SETTING_NAME = '';
    static _objectId = 0;
    _objectId: number;
    constructor() {
        this._objectId = ItemBase._objectId++;
    }
    get colorNote() {
        if (this.metadata && this.metadata['colorNote']) {
            return this.metadata['colorNote'];
        }
        return null;
    }
    set colorNote(c: string | null) {
        if (this.metadata) {
            this.metadata['colorNote'] = c;
        }
        this.save();
    }
    get isSelected() {
        throw new Error('Method not implemented.');
    }
    set isSelected(b: boolean) {
        throw new Error('Method not implemented.');
    }
    async save(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    clone() {
        throw new Error('Method not implemented.');
    }
    toJson() {
        throw new Error('Method not implemented.');
    }
    static fromJson(json: any): any {
        throw new Error('Method not implemented.');
    }
    static validate(json: any) {
        throw new Error('Method not implemented.');
    }
    static _toSelectedItemSetting(fileSource: FileSource | null, id: number | string | null) {
        if (fileSource === null || id === null) {
            return null;
        }
        return `${fileSource.filePath},${id}`;
    }
    toSelectedItemSetting() {
        if (!this.fileSource) {
            return null;
        }
        return ItemBase._toSelectedItemSetting(this.fileSource, this.id);
    }
    static fromSelectedItemSetting(selectedItemSetting: string | null) {
        if (selectedItemSetting === null) {
            return null;
        }
        const [bibleFilePath, id] = selectedItemSetting.split(',');
        if (isNaN(Number(id))) {
            return null;
        }
        return {
            fileSource: FileSource.genFileSource(bibleFilePath),
            id: Number(id),
        };
    }
    static setSelectedItem(item: ItemBase | null) {
        if (item === null) {
            setSetting(this.SELECT_SETTING_NAME, '');
            return;
        }
        const selectedStr = item.toSelectedItemSetting();
        if (selectedStr !== null) {
            setSetting(this.SELECT_SETTING_NAME, selectedStr);
            return true;
        }
        return false;
    }
    static getSelected() {
        const selectedStr = getSetting(this.SELECT_SETTING_NAME, '');
        return this.fromSelectedItemSetting(selectedStr);
    }
    static async getSelectedItem(): Promise<ItemBase | null> {
        throw new Error('Method not implemented.');
    }
}
