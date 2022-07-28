import BibleItem from '../bible-list/BibleItem';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { anyObjectType } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import LyricItem from './LyricItem';

export type LyricType = {
    items: LyricItem[],
}
export default class Lyric extends ItemSource<LyricType>{
    static SELECT_SETTING_NAME = 'lyric-selected';
    SELECT_SETTING_NAME = 'lyric-selected';
    static fromJson(json: anyObjectType, fileSource: FileSource) {
        this.validate(json);
        return new Lyric(fileSource, json.metadata, json.content);
    }
    get items() {
        return this.content.items;
    }
    itemFromJson(json: anyObjectType) {
        return LyricItem.fromJson(json, this.fileSource);
    }
    itemFromJsonError(json: anyObjectType) {
        return LyricItem.fromJsonError(json, this.fileSource);
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
        this.fileSource.fireRefreshDirEvent();
    }
    static mimetype: MimetypeNameType = 'lyric';
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
    static toNew(name: string) {
        return {
            title: name,
            text: `Block1
===
Block2
===
Block3`,
        };
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, {
            items: [Lyric.toNew(name)],
        });
    }
    static async clearSelection() {
        const lyric = await this.getSelected();
        if (lyric) {
            lyric.isSelected = false;
        }
    }
}
