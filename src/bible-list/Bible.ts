import {
    fsListFilesWithMimetype,
    MimetypeNameType,
} from '../server/fileHelpers';
import FileSource from '../helper/FileSource';
import { AnyObjectType, cloneJson, toMaxId } from '../helper/helpers';
import { AppDocumentSourceAbs } from '../helper/AppEditableDocumentSourceAbs';
import { getSetting } from '../helper/settingHelpers';
import BibleItem from './BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { BibleItemType } from './bibleItemHelpers';
import { dirSourceSettingNames } from '../helper/constants';
import appProvider from '../server/appProvider';
import DocumentInf from '../others/DocumentInf';
import { handleError } from '../helper/errorHelpers';

export type BibleType = {
    items: BibleItemType[];
    metadata: AnyObjectType;
};
export default class Bible extends AppDocumentSourceAbs implements DocumentInf {
    static readonly mimetypeName: MimetypeNameType = 'bible';
    static readonly DEFAULT_FILE_NAME = 'Default';
    private readonly originalJson: BibleType;

    constructor(filePath: string, json: BibleType) {
        super(filePath);
        this.originalJson = cloneJson(json);
    }

    static getDirSourceSettingName() {
        const dirSourceSettingName = appProvider.isPageReader
            ? dirSourceSettingNames.BIBLE_READ
            : dirSourceSettingNames.BIBLE_PRESENT;
        return dirSourceSettingName;
    }

    static fromJson(filePath: string, json: any) {
        this.validate(json);
        return new this(filePath, json);
    }

    get metadata() {
        return this.originalJson.metadata;
    }

    get itemsLength() {
        return this.originalJson.items.length;
    }

    get items() {
        return this.originalJson.items.map((json) => {
            try {
                return BibleItem.fromJson(json, this.filePath);
            } catch (error: any) {
                showSimpleToast('Instantiating Bible Item', error.message);
            }
            return BibleItem.fromJsonError(json, this.filePath);
        });
    }

    set items(newBibleItems: BibleItem[]) {
        const bibleItems = newBibleItems.map((item) => item.toJson());
        this.originalJson.items = bibleItems;
    }

    getItemById(id: number) {
        return (
            this.items.find((item) => {
                return item.id === id;
            }) || null
        );
    }

    setItemById(id: number, item: BibleItem) {
        const items = this.items;
        const newItems = items.map((item1) => {
            if (item1.id === id) {
                return item;
            }
            return item1;
        });
        this.items = newItems;
    }

    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return toMaxId(ids);
        }
        return 0;
    }

    static checkIsDefault(filePath: string) {
        const fileSource = FileSource.getInstance(filePath);
        return fileSource.name === this.DEFAULT_FILE_NAME;
    }

    get isDefault() {
        return Bible.checkIsDefault(this.filePath);
    }

    get isOpened() {
        return this.metadata['isOpened'] === true;
    }

    async setIsOpened(isOpened: boolean) {
        this.metadata['isOpened'] = isOpened;
        await this.save();
    }

    static async addBibleItemToDefault(bibleItem: BibleItem) {
        const bible = await this.getDefault();
        if (bible !== null) {
            bible.addBibleItem(bibleItem);
            if (await bible.save()) {
                return bibleItem;
            }
        }
        return null;
    }

    duplicate(index: number) {
        const bibleItems = this.items;
        const newItem = bibleItems[index].clone();
        newItem.id = this.maxItemId + 1;
        bibleItems.splice(index + 1, 0, newItem);
        this.items = bibleItems;
    }

    deleteItemAtIndex(index: number): BibleItem | null {
        const bibleItems = this.items;
        const removedItems = bibleItems.splice(index, 1);
        this.items = bibleItems;
        return removedItems[0] ?? null;
    }

    deleteItem(bibleItem: BibleItem) {
        const bibleItems = this.items;
        const index = bibleItems.indexOf(bibleItem);
        if (index !== -1) {
            this.deleteItemAtIndex(index);
        }
    }

    addBibleItem(bibleItem: BibleItem) {
        const newBibleItem = BibleItem.fromJson(
            bibleItem.toJson(),
            this.filePath,
        );
        newBibleItem.id = this.maxItemId + 1;
        const bibleItems = this.items;
        bibleItems.push(newBibleItem);
        this.items = bibleItems;
    }

    swapItem(fromIndex: number, toIndex: number) {
        const bibleItems = this.items;
        const fromItem = bibleItems[fromIndex];
        const toItem = bibleItems[toIndex];
        bibleItems[fromIndex] = toItem;
        bibleItems[toIndex] = fromItem;
        this.items = bibleItems;
    }

    async moveItemFrom(filePath: string, index?: number) {
        try {
            const fromBible = await Bible.fromFilePath(filePath);
            if (!fromBible) {
                showSimpleToast('Moving Bible Item', 'Cannot source Bible');
                return;
            }
            const backupBibleItems = fromBible.items;
            let targetBibleItems: BibleItem[] = backupBibleItems;
            if (index !== undefined) {
                if (!backupBibleItems[index]) {
                    showSimpleToast(
                        'Moving Bible Item',
                        'Cannot find Bible Item',
                    );
                    return;
                }
                targetBibleItems = [backupBibleItems[index]];
            }
            this.items = this.items.concat(targetBibleItems);
            await this.save();

            fromBible.items = backupBibleItems.filter((item) => {
                return !targetBibleItems.includes(item);
            });
            await fromBible.save();
        } catch (error: any) {
            showSimpleToast('Moving Bible Item', error.message);
        }
    }

    static async getDefault() {
        const dir = getSetting(Bible.getDirSourceSettingName(), '');
        if (!dir) {
            return null;
        }
        const filePaths = (await fsListFilesWithMimetype(dir, 'bible')) ?? [];
        if (filePaths === null) {
            return null;
        }
        for (const filePath of filePaths) {
            if (Bible.checkIsDefault(filePath)) {
                return Bible.fromFilePath(filePath);
            }
        }
        const defaultFileSource = await this.create(
            dir,
            Bible.DEFAULT_FILE_NAME,
        );
        const filePath = defaultFileSource?.filePath ?? null;
        const defaultBible = filePath
            ? await Bible.fromFilePath(filePath)
            : null;
        if (!defaultBible) {
            showSimpleToast(
                'Getting Default Bible File',
                'Fail to get default bible file',
            );
            return null;
        }
        await defaultBible.setIsOpened(true);
        return defaultBible;
    }

    static async create(dir: string, name: string) {
        return super.create(dir, name, []);
    }

    clone() {
        return Bible.fromJson(this.filePath, this.toJson());
    }

    empty() {
        this.items = [];
    }

    toJson() {
        return this.originalJson;
    }

    async save() {
        const jsonData = this.toJson();
        const jsonString = JSON.stringify(jsonData);
        return await this.fileSource.saveFileData(jsonString);
    }

    static async fromFilePath(filePath: string) {
        const jsonString = await FileSource.readFileData(filePath);
        if (!jsonString) {
            return null;
        }
        try {
            const jsonData = JSON.parse(jsonString);
            return this.fromJson(filePath, jsonData);
        } catch (error) {
            handleError(error);
        }
        return null;
    }
}
