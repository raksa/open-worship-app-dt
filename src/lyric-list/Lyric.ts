import BibleItem from '../bible-list/BibleItem';
import { previewingEventListener } from '../event/PreviewingEventListener';
import ToastEventListener from '../event/ToastEventListener';
import { MimetypeNameType } from '../server/fileHelper';
import FileSource from '../helper/FileSource';
import { AnyObjectType } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import LyricEditingCacheManager from './LyricEditingCacheManager';
import LyricItem, { LyricItemType } from './LyricItem';

export type LyricEditingHistoryType = {
    items?: LyricItemType[],
    metadata?: AnyObjectType,
};

export type LyricType = {
    items: LyricItemType[],
    metadata: AnyObjectType,
}
export default class Lyric extends ItemSource<LyricItem>{
    static mimetype: MimetypeNameType = 'lyric';
    static SELECT_SETTING_NAME = 'lyric-selected';
    SELECT_SETTING_NAME = 'lyric-selected';
    editingCacheManager: LyricEditingCacheManager;
    constructor(fileSource: FileSource, json: LyricType) {
        super(fileSource);
        this.editingCacheManager = new LyricEditingCacheManager(
            this.fileSource, json);
    }
    get isChanged() {
        return this.editingCacheManager.isChanged;
    }
    get metadata() {
        return this.editingCacheManager.presentJson.metadata;
    }
    get items() {
        const latestHistory = this.editingCacheManager.presentJson;
        return latestHistory.items.map((json) => {
            try {
                return LyricItem.fromJson(json as any,
                    this.fileSource, this.editingCacheManager);
            } catch (error: any) {
                ToastEventListener.showSimpleToast({
                    title: 'Instantiating Bible Item',
                    message: error.message,
                });
            }
            return LyricItem.fromJsonError(json, this.fileSource,
                this.editingCacheManager);
        });
    }
    set items(newItems: LyricItem[]) {
        const lyricItems = newItems.map((item) => item.toJson());
        this.editingCacheManager.pushLyricItems(lyricItems);
    }
    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return Math.max.apply(Math, ids);
        }
        return 0;
    }
    get isSelected() {
        const selectedFS = Lyric.getSelectedFileSource();
        return this.fileSource.filePath === selectedFS?.filePath;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (b) {
            Lyric.setSelectedFileSource(this.fileSource);
            BibleItem.clearSelection();
            previewingEventListener.selectLyric(this);
        } else {
            Lyric.setSelectedFileSource(null);
            previewingEventListener.selectLyric(null);
        }
        this.fileSource.fireSelectEvent();
    }
    static fromJson(fileSource: FileSource, json: any) {
        this.validate(json);
        return new Lyric(fileSource, json);
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return super.readFileToDataNoCache(fileSource) as Promise<Lyric | null | undefined>;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        return super.readFileToData(fileSource, isForceCache) as Promise<Lyric | null | undefined>;
    }
    static async getSelected() {
        const fileSource = this.getSelectedFileSource();
        if (fileSource !== null) {
            return Lyric.readFileToData(fileSource);
        }
        return null;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name,
            [LyricItem.genDefaultLyric(name)]);
    }
    static async clearSelection() {
        const lyric = await this.getSelected();
        if (lyric) {
            lyric.isSelected = false;
        }
    }
    addItem(lyricItem: LyricItem) {
        const items = this.items;
        lyricItem.id = this.maxItemId + 1;
        items.push(lyricItem);
        this.items = items;
    }
    deleteItem(lyricItem: LyricItem) {
        const newItems = this.items.filter((item) => {
            return item.id !== lyricItem.id;
        });
        const result = LyricItem.getSelectedResult();
        if (result?.id === lyricItem.id) {
            LyricItem.setSelectedItem(null);
        }
        this.items = newItems;
    }
    async save(): Promise<boolean> {
        const isSuccess = await super.save();
        if (isSuccess) {
            LyricItem.clearCache();
            this.editingCacheManager.save();
        }
        return isSuccess;
    }
    clone() {
        return Lyric.fromJson(this.fileSource, this.toJson());
    }
}
