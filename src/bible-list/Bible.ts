import { toastEventListener } from '../event/ToastEventListener';
import fileHelpers, { MimetypeNameType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { AnyObjectType } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { getSetting } from '../helper/settingHelper';
import BibleItem from './BibleItem';

export type BibleType = {
    items: BibleItem[],
    metadata: AnyObjectType,
}
export default class Bible extends ItemSource<BibleType>{
    static SELECT_DIR_SETTING = 'bible-list-selected-dir';
    static DEFAULT_FILE_NAME = 'Default';
    static fromJson(json: AnyObjectType, fileSource: FileSource) {
        this.validate(json);
        return new Bible(fileSource, json.metadata, json.content);
    }
    itemFromJson(json: AnyObjectType) {
        return BibleItem.fromJson(json, this.fileSource);
    }
    itemFromJsonError(json: AnyObjectType) {
        return BibleItem.fromJsonError(json, this.fileSource);
    }
    get items() {
        return this.content.items;
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
        const index = this.items.indexOf(bibleItem);
        this.content.items.splice(index, 1);
        return this.save();
    }
    async addItem(item: BibleItem) {
        item.fileSource = this.fileSource;
        item.id = this.maxItemId + 1;
        this.content.items.push(item);
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
            toastEventListener.showSimpleToast({
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
        const fileSources = await fileHelpers.listFilesWithMimetype(dir, 'bible') || [];
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
            toastEventListener.showSimpleToast({
                title: 'Getting Default Bible File',
                message: 'Fail to get default bible file',
            });
            return null;
        }
        await defaultBible.setIsOpened(true);
        return defaultBible;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, {
            items: [],
        });
    }
}
