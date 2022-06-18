import { toastEventListener } from '../event/ToastEventListener';
import { MetaDataType, MimetypeNameType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { validateMeta } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { setSetting, getSetting } from '../helper/settingHelper';
import BibleItem from './BibleItem';

export type BibleType = {
    items: BibleItem[],
    metadata: MetaDataType,
}
export default class Bible extends ItemSource<BibleType>{
    get isSelected() {
        const selectedFS = Bible.getSelectedBibleFileSource();
        return this.fileSource.filePath === selectedFS?.filePath;
    }
    set isSelected(b: boolean) {
        if (b) {
            Bible.setSelectedBibleFileSource(this.fileSource);
        } else {
            Bible.setSelectedBibleFileSource(null);
        }
    }
    get isDefault() {
        return this.content.metadata['isDefault'];
    }
    static mimetype: MimetypeNameType = 'bible';
    static validator: (json: Object) => boolean = validateBible;
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Bible(fileSource, json.metadata, json.content);
    }
    static _initItems(bible: ItemSource<any>) {
        bible.content.items = bible.content.items.map((item: any) => {
            return new BibleItem(item.id, item.bible, item.target,
                item.metadata, bible.fileSource);
        });
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        const bible = await ItemSource._readFileToDataNoCache<Bible>(fileSource,
            validateBible, this._instantiate);
        if (bible) {
            this._initItems(bible);
        }
        return bible;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        const bible = await ItemSource._readFileToData<Bible>(fileSource,
            validateBible, this._instantiate, isForceCache);
        if (bible) {
            this._initItems(bible);
        }
        return bible;
    }
    static async getDefaultBible(dir: string, fileSources: FileSource[] | null) {
        const showFailMessage = () => {
            toastEventListener.showSimpleToast({
                title: 'Adding Bible',
                message: 'Fail to add new bible',
            });
        };
        if (fileSources === null) {
            showFailMessage();
            return null;
        }
        for (const fileSource of fileSources) {
            const bible = await Bible.readFileToData(fileSource);
            if (bible && bible.isDefault) {
                return bible;
            }
        }
        const defaultFS = await this.createNew(dir, 'Default', {
            items: [],
            metadata: {
                isDefault: true,
            },
        });
        const defaultBible = await Bible.readFileToData(defaultFS);
        if (!defaultBible) {
            showFailMessage();
            return null;
        }
        return defaultBible;
    }
    static clearSelectedBible() {
        this.setSelectedBibleFileSource(null);
    }
    static setSelectedBibleFileSource(fileSource: FileSource | null) {
        setSetting('selected-bible', fileSource?.filePath || '');
    }
    static getSelectedBibleFileSource() {
        const filePath = getSetting('selected-bible', '');
        if (filePath) {
            return FileSource.genFileSource(filePath);
        }
        return null;
    }
    static async getSelectedBible() {
        const fileSource = this.getSelectedBibleFileSource();
        if (fileSource !== null) {
            return Bible.readFileToData(fileSource);
        }
        return null;
    }
    static async updateBibleItem(newBibleItem: BibleItem) {
        const bible = await Bible.readFileToData(newBibleItem.fileSource);
        bible?.content.items.forEach((item) => {
            if (item.id === newBibleItem.id) {
                item.update(newBibleItem.bible, newBibleItem.target);
            }
        });
    }
}

function validateBibleItem(item: any) {
    try {
        if (!item.bible ||
            !item.id ||
            !item.metadata || typeof item.metadata !== 'object' ||
            !item.target || typeof item.target !== 'object' ||
            !item.target.book ||
            typeof item.target.chapter !== 'number' ||
            typeof item.target.startVerse !== 'number' ||
            typeof item.target.endVerse !== 'number') {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
}

export function validateBible(json: any) {
    try {
        if (!json.content || typeof json.content !== 'object'
            || !json.content.items ||
            !(json.content.items instanceof Array)) {
            return false;
        }
        const content = json.content;
        if (!(content.items as any[]).every((item) => {
            return validateBibleItem(item);
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
