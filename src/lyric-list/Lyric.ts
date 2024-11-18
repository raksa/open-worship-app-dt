import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../server/fileHelper';
import FileSource from '../helper/FileSource';
import { AnyObjectType, toMaxId } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import LyricEditorCacheManager from './LyricEditorCacheManager';
import LyricItem, { LyricItemType } from './LyricItem';
import { showSimpleToast } from '../toast/toastHelpers';

export type LyricEditorHistoryType = {
    items?: LyricItemType[],
    metadata?: AnyObjectType,
};

export type LyricType = {
    items: LyricItemType[],
    metadata: AnyObjectType,
}
export default class Lyric extends ItemSource<LyricItem>{
    static readonly mimetype: MimetypeNameType = 'lyric';
    static readonly SELECT_SETTING_NAME = 'lyric-selected';
    SELECT_SETTING_NAME = 'lyric-selected';
    editorCacheManager: LyricEditorCacheManager;
    constructor(filePath: string, json: LyricType) {
        super(filePath);
        this.editorCacheManager = new LyricEditorCacheManager(
            this.filePath, json,
        );
    }
    get isChanged() {
        return this.editorCacheManager.isChanged;
    }
    get metadata() {
        return this.editorCacheManager.presenterJson.metadata;
    }
    get items() {
        const latestHistory = this.editorCacheManager.presenterJson;
        return latestHistory.items.map((json) => {
            try {
                return LyricItem.fromJson(
                    json as any, this.filePath, this.editorCacheManager,
                );
            } catch (error: any) {
                showSimpleToast('Instantiating Bible Item', error.message);
            }
            return LyricItem.fromJsonError(
                json, this.filePath, this.editorCacheManager,
            );
        });
    }
    set items(newItems: LyricItem[]) {
        const lyricItems = newItems.map((item) => item.toJson());
        this.editorCacheManager.pushLyricItems(lyricItems);
    }
    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return toMaxId(ids);
        }
        return 0;
    }
    get isSelected() {
        const selectedFilePath = Lyric.getSelectedFilePath();
        return this.filePath === selectedFilePath;
    }
    set isSelected(isSelected: boolean) {
        if (this.isSelected === isSelected) {
            return;
        }
        if (isSelected) {
            Lyric.setSelectedFileSource(this.filePath);
            previewingEventListener.selectLyric(this);
        } else {
            Lyric.setSelectedFileSource(null);
            previewingEventListener.selectLyric(null);
        }
        FileSource.getInstance(this.filePath).fireSelectEvent();
    }
    static fromJson(filePath: string, json: any) {
        this.validate(json);
        return new Lyric(filePath, json);
    }
    static async readFileToDataNoCache(filePath: string | null) {
        return super.readFileToDataNoCache(
            filePath,
        ) as Promise<Lyric | null | undefined>;
    }
    static async readFileToData(
        filePath: string | null, isForceCache?: boolean,
    ) {
        return super.readFileToData(
            filePath, isForceCache,
        ) as Promise<Lyric | null | undefined>;
    }
    static async getSelected() {
        const fileSource = this.getSelectedFilePath();
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
            LyricItem.setSelected(null);
        }
        this.items = newItems;
    }
    async save(): Promise<boolean> {
        const isSuccess = await super.save();
        if (isSuccess) {
            LyricItem.clearCache();
            this.editorCacheManager.save();
        }
        return isSuccess;
    }
    clone() {
        return Lyric.fromJson(this.filePath, this.toJson());
    }
}
