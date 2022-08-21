import ToastEventListener from '../event/ToastEventListener';
import {
    fsListFilesWithMimetype,
    MimetypeNameType,
} from '../server/fileHelper';
import FileSource from '../helper/FileSource';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { getSetting } from '../helper/settingHelper';
import BibleItem, { BibleItemType } from './BibleItem';

export type BibleType = {
    items: BibleItemType[],
    metadata: AnyObjectType,
}
export default class Bible extends ItemSource<BibleItem>{
    static SELECT_DIR_SETTING = 'bible-list-selected-dir';
    static DEFAULT_FILE_NAME = 'Default';
    _originalJson: BibleType;
    constructor(fileSource: FileSource, json: BibleType) {
        super(fileSource);
        this._originalJson = cloneJson(json);
    }
    static fromJson(fileSource: FileSource, json: any) {
        this.validate(json);
        return new Bible(fileSource, json);
    }
    get metadata() {
        return this._originalJson.metadata;
    }
    get items() {
        return this._originalJson.items.map((json) => {
            try {
                return BibleItem.fromJson(json, this.fileSource);
            } catch (error: any) {
                ToastEventListener.showSimpleToast({
                    title: 'Instantiating Bible Item',
                    message: error.message,
                });
            }
            return BibleItem.fromJsonError(json, this.fileSource);
        });
    }
    set items(newItems: BibleItem[]) {
        const items = newItems.map((item) => item.toJson());
        this._originalJson.items = items;
    }
    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return Math.max.apply(Math, ids);
        }
        return 0;
    }
    static checkIsDefault(fileSource: FileSource) {
        return fileSource.name === Bible.DEFAULT_FILE_NAME;
    }
    get isDefault() {
        return Bible.checkIsDefault(this.fileSource);
    }
    get isSelected() {
        return this.items.some((item) => item.isSelected);
    }
    get isOpened() {
        return this.metadata['isOpened'] === true;
    }
    async setIsOpened(b: boolean) {
        this.metadata['isOpened'] = b;
        this.save();
    }
    getItemById(id: number) {
        return this.items.find((item) => item.id === id) || null;
    }
    static async updateOrToDefault(bibleItem: BibleItem) {
        const selectedBibleItem = await BibleItem.getSelectedItemEditing();
        if (selectedBibleItem) {
            selectedBibleItem.update(bibleItem);
            if (await selectedBibleItem.save()) {
                return selectedBibleItem;
            }
        } else {
            const bible = await Bible.getDefault();
            if (bible) {
                bible.addItem(bibleItem);
                if (await bible.save()) {
                    return bibleItem;
                }
            }
        }
        return null;
    }
    async removeItem(bibleItem: BibleItem) {
        const items = this.items;
        const index = items.indexOf(bibleItem);
        items.splice(index, 1);
        this.items = items;
        return this.save();
    }
    async addItem(item: BibleItem) {
        item.fileSource = this.fileSource;
        item.id = this.maxItemId + 1;
        const items = this.items;
        items.push(item);
        this.items = items;
        return this.save();
    }
    async moveItemFrom(bibleItem: BibleItem, fileSource: FileSource) {
        try {
            const isSelected = bibleItem.isSelected;
            const id = bibleItem.id;
            await this.addItem(bibleItem);
            const fromBible = await Bible.readFileToData(fileSource);
            if (fromBible) {
                const item = fromBible.getItemById(id);
                if (item !== null) {
                    await fromBible.removeItem(item);
                }
            }
            if (isSelected) {
                bibleItem.isSelected = true;
            }
        } catch (error: any) {
            ToastEventListener.showSimpleToast({
                title: 'Moving Bible Item',
                message: error.message,
            });
        }
    }
    static mimetype: MimetypeNameType = 'bible';
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return super.readFileToDataNoCache(fileSource) as Promise<Bible | null | undefined>;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        return super.readFileToData(fileSource, isForceCache) as Promise<Bible | null | undefined>;
    }
    static async getDefault() {
        const dir = getSetting(Bible.SELECT_DIR_SETTING, '');
        const fileSources = await fsListFilesWithMimetype(dir, 'bible') || [];
        if (fileSources === null) {
            return null;
        }
        for (const fileSource of fileSources) {
            if (Bible.checkIsDefault(fileSource)) {
                return Bible.readFileToData(fileSource);
            }
        }
        const defaultFS = await this.create(dir, Bible.DEFAULT_FILE_NAME);
        const defaultBible = await Bible.readFileToData(defaultFS);
        if (!defaultBible) {
            ToastEventListener.showSimpleToast({
                title: 'Getting Default Bible File',
                message: 'Fail to get default bible file',
            });
            return null;
        }
        await defaultBible.setIsOpened(true);
        return defaultBible;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, []);
    }
    clone() {
        return Bible.fromJson(this.fileSource, this.toJson());
    }
}
