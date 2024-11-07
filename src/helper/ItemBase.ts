import { setSetting, getSetting } from '../helper/settingHelper';
import ColorNoteInf from './ColorNoteInf';
import { AnyObjectType } from './helpers';

export abstract class ItemBase implements ColorNoteInf {
    abstract id: number;
    abstract filePath: string;
    protected static SELECT_SETTING_NAME: string;
    protected static copiedKey: string | null;
    _isError: boolean = false;
    get isError() {
        return !!this._isError;
    }
    set isError(isError: boolean) {
        this._isError = isError;
    }
    abstract getMetadata(): Promise<AnyObjectType>;
    abstract setMetadata(metadata: AnyObjectType): Promise<void>;
    async getColorNote() {
        const metadata = await this.getMetadata();
        return metadata['colorNote'] || null;
    }
    async setColorNote(color: string | null) {
        const metadata = await this.getMetadata();
        metadata['colorNote'] = color;
        // TODO: implement this
        this.save();
    }
    async save(_?: any): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    abstract clone(): ItemBase;
    toJson() {
        throw new Error('Method not implemented.');
    }
    static fromJson(_filePath?: string): any {
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
    get isSelectedEditing() {
        throw new Error('Method not implemented.');
    }
    set isSelectedEditing(_b: boolean) {
        throw new Error('Method not implemented.');
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
