import {
    toastEventListener,
} from '../event/ToastEventListener';
import fileHelpers, {
    MetaDataType, MimetypeNameType,
} from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { validateMeta } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { getSetting } from '../helper/settingHelper';
import BibleItem from './BibleItem';

export type BibleType = {
    items: BibleItem[],
    metadata: MetaDataType,
}
export default class Bible extends ItemSource<BibleType>{
    static SELECT_DIR_SETTING = 'bible-list-selected-dir';
    static DEFAULT_FILE_NAME = 'Default';
    static validator(json: any) {
        try {
            if (!json.content || typeof json.content !== 'object'
                || !json.content.items ||
                !(json.content.items instanceof Array)) {
                return false;
            }
            const content = json.content;
            if (!(content.items as any[]).every((item) => {
                return BibleItem.validate(item);
            })) {
                return false;
            }
            if (!validateMeta(json.metadata)) {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        return true;
    }
    toJson() {
        const content = {
            ...this.content,
            items: this.items.map((item) => item.toJson()),
        };
        return {
            metadata: this.metadata,
            content,
        };
    }
    get items() {
        return this.content.items;
    }
    get maxId() {
        return Math.max.apply(Math, this.items.map((item) => +item.id));
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
    static async addItem(item: BibleItem) {
        if (item.fileSource) {
            const bible = await Bible.readFileToData(item.fileSource);
            bible?.getItemById(item.id)?.update(item.bibleName, item.target, item.metadata);
            await bible?.save();
        } else {
            const bible = await Bible.getDefault();
            if (bible) {
                bible.content.items.push(item);
                item.fileSource = bible.fileSource;
                item.id = bible.maxId;
                item.isSelected = true;
                return await bible.save();
            }
        }
        return false;
    }
    static mimetype: MimetypeNameType = 'bible';
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Bible(fileSource, json.metadata, json.content);
    }
    static _initItems(bible: ItemSource<any>) {
        bible.content.items = bible.content.items.map((item: any) => {
            return new BibleItem(item.id, item.bibleName, item.target,
                item.metadata, bible.fileSource);
        });
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        const bible = await super._readFileToDataNoCache<Bible>(fileSource,
            this.validator, this._instantiate);
        if (bible) {
            this._initItems(bible);
        }
        return bible;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        const bible = await super._readFileToData<Bible>(fileSource,
            this.validator, this._instantiate, isForceCache);
        if (bible) {
            this._initItems(bible);
        }
        return bible;
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
