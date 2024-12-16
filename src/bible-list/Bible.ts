import {
    fsListFilesWithMimetype, MimetypeNameType,
} from '../server/fileHelpers';
import FileSource from '../helper/FileSource';
import {
    AnyObjectType, cloneJson, toMaxId,
} from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { getSetting } from '../helper/settingHelpers';
import BibleItem from './BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { BibleItemType } from './bibleItemHelpers';
import { dirSourceSettingNames } from '../helper/constants';
import appProvider from '../server/appProvider';

export type BibleType = {
    items: BibleItemType[],
    metadata: AnyObjectType,
}
export default class Bible extends ItemSource<BibleItem> {
    static readonly DEFAULT_FILE_NAME = 'Default';
    private readonly originalJson: BibleType;
    constructor(filePath: string, json: BibleType) {
        super(filePath);
        this.originalJson = cloneJson(json);
    }
    static getDirSourceSettingName() {
        const dirSourceSettingName = (
            appProvider.isPageReader ? dirSourceSettingNames.BIBLE_READ :
                dirSourceSettingNames.BIBLE_PRESENT
        );
        return dirSourceSettingName;
    }
    static fromJson(filePath: string, json: any) {
        this.validate(json);
        return new Bible(filePath, json);
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
    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return toMaxId(ids);
        }
        return 0;
    }
    static checkIsDefault(filePath: string) {
        const fileSource = FileSource.getInstance(filePath);
        return fileSource.name === Bible.DEFAULT_FILE_NAME;
    }
    get isDefault() {
        return Bible.checkIsDefault(this.filePath);
    }
    get isSelected() {
        return false;
    }
    get isOpened() {
        return this.metadata['isOpened'] === true;
    }
    async setIsOpened(b: boolean) {
        this.metadata['isOpened'] = b;
        this.save();
    }
    getItemById(id: number): BibleItem | null {
        return this.items.find((item) => item.id === id) || null;
    }
    setItemById(id: number, bibleItem: BibleItem) {
        const bibleItems = this.items;
        const newItems = bibleItems.map((item1) => {
            if (item1.id === id) {
                return bibleItem;
            }
            return item1;
        });
        this.items = newItems;
    }
    static async addBibleItemToDefault(bibleItem: BibleItem) {
        const bible = await Bible.getDefault();
        if (bible) {
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
        return removedItems[0] || null;
    }
    deleteItem(bibleItem: BibleItem) {
        const bibleItems = this.items;
        const index = bibleItems.indexOf(bibleItem);
        if (index !== -1) {
            this.deleteItemAtIndex(index);
        }
    }
    addBibleItem(bibleItem: BibleItem) {
        bibleItem.filePath = this.filePath;
        bibleItem.id = this.maxItemId + 1;
        const bibleItems = this.items;
        bibleItems.push(bibleItem);
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
            const fromBible = await Bible.readFileToData(filePath);
            if (!fromBible) {
                showSimpleToast('Moving Bible Item', 'Cannot source Bible');
                return;
            }
            const backupBibleItems = fromBible.items;
            let targetBibleItems: BibleItem[] = backupBibleItems;
            if (index !== undefined) {
                if (!backupBibleItems[index]) {
                    showSimpleToast(
                        'Moving Bible Item', 'Cannot find Bible Item',
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
    static readonly mimetype: MimetypeNameType = 'bible';
    static async readFileToDataNoCache(filePath: string | null) {
        return super.readFileToDataNoCache(
            filePath,
        ) as Promise<Bible | null | undefined>;
    }
    static async readFileToData(
        filePath: string | null, isForceCache?: boolean,
    ) {
        return super.readFileToData(
            filePath, isForceCache,
        ) as Promise<Bible | null | undefined>;
    }
    static async getDefault() {
        const dir = getSetting(Bible.getDirSourceSettingName(), '');
        if (!dir) {
            return null;
        }
        const filePaths = await fsListFilesWithMimetype(dir, 'bible') || [];
        if (filePaths === null) {
            return null;
        }
        for (const filePath of filePaths) {
            if (Bible.checkIsDefault(filePath)) {
                return Bible.readFileToData(filePath);
            }
        }
        const defaultFS = await this.create(dir, Bible.DEFAULT_FILE_NAME);
        const defaultBible = await Bible.readFileToData(
            defaultFS?.filePath || null,
        );
        if (!defaultBible) {
            showSimpleToast('Getting Default Bible File',
                'Fail to get default bible file');
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
}
