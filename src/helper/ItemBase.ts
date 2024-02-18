import { setSetting, getSetting } from '../helper/settingHelper';
import ColorNoteInf from './ColorNoteInf';
import { AnyObjectType, cloneJson } from './helpers';

export abstract class ItemBase implements ColorNoteInf {
    abstract id: number;
    abstract filePath?: string | null;
    protected static SELECT_SETTING_NAME = '';
    protected static copiedItem: ItemBase | null = null;
    jsonError: any;
    get isError() {
        return !!this.jsonError;
    }
    abstract get metadata(): AnyObjectType;
    abstract set metadata(metadata: AnyObjectType);
    async getColorNote() {
        if (this.metadata?.['colorNote']) {
            return this.metadata['colorNote'];
        }
        return null;
    }
    async setColorNote(c: string | null) {
        const metadata = cloneJson(this.metadata);
        metadata['colorNote'] = c;
        this.metadata = metadata;
        this.save();
    }
    get isSelectedEditing() {
        throw new Error('Method not implemented.');
    }
    set isSelectedEditing(_b: boolean) {
        throw new Error('Method not implemented.');
    }
    async save(_?: any): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    abstract clone(): ItemBase;
    toJson() {
        throw new Error('Method not implemented.');
    }
    static fromJson(_json: AnyObjectType, _filePath?: string): any {
        throw new Error('Method not implemented.');
    }
    static fromJsonError(_json: AnyObjectType, _filePath?: string): any {
        throw new Error('Method not implemented.');
    }
    static validate(_json: AnyObjectType) {
        throw new Error('Method not implemented.');
    }
    static _toSelectedItemSetting(
        filePath: string | null, id: number | string | null,
    ) {
        if (filePath === null || id === null) {
            return null;
        }
        return `${filePath},${id}`;
    }
    toSelectedItemSetting() {
        if (!this.filePath) {
            return null;
        }
        return ItemBase._toSelectedItemSetting(this.filePath, this.id);
    }
    static extractItemSetting(selectedItemSetting: string | null) {
        if (selectedItemSetting === null) {
            return null;
        }
        const [bibleFilePath, id] = selectedItemSetting.split(',');
        if (isNaN(Number(id))) {
            return null;
        }
        return {
            filePath: bibleFilePath,
            id: Number(id),
        };
    }
    static _setItemSetting(settingName: string, item: ItemBase | null) {
        if (item === null) {
            setSetting(settingName, '');
            return;
        }
        const selectedStr = item.toSelectedItemSetting();
        if (selectedStr !== null) {
            setSetting(settingName, selectedStr);
            return true;
        }
        return false;
    }
    static _getSettingResult(settingName: string) {
        const selectedStr = getSetting(settingName, '');
        return this.extractItemSetting(selectedStr);
    }
    static setSelectedItem(item: ItemBase | null) {
        return this._setItemSetting(this.SELECT_SETTING_NAME, item);
    }
    static getSelectedResult() {
        return this._getSettingResult(this.SELECT_SETTING_NAME);
    }
    static setSelectedEditingItem(item: ItemBase | null) {
        return this._setItemSetting(
            `${this.SELECT_SETTING_NAME}-editing`, item,
        );
    }
    static async getSelectedItem(): Promise<ItemBase | null | undefined> {
        throw new Error('Method not implemented.');
    }
}
