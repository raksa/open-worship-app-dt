import { previewingEventListener } from '../event/PreviewingEventListener';
import { MetaDataType, MimetypeNameType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { validateMeta } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { setSetting, getSetting } from '../helper/settingHelper';
import LyricItem from './LyricItem';

export type LyricType = {
    index?: number,
    items: LyricItem[],
}
export default class Lyric extends ItemSource<LyricType>{
    static SELECT_SETTING_NAME = 'lyric-selected';
    constructor(fileSource: FileSource, metadata: MetaDataType,
        content: LyricType) {
        super(fileSource, metadata, content);
        this.SELECT_SETTING_NAME = Lyric.SELECT_SETTING_NAME;
    }
    static validate(json: any) {
        try {
            if (!json.content || typeof json.content !== 'object'
                || !json.content.items || !(json.content.items instanceof Array)) {
                return false;
            }
            const content = json.content;
            if (!(content.items as any[]).every((item) => {
                return LyricItem.validate(item);
            })) {
                return false;
            }
            if (content.index !== undefined && typeof content.index !== 'number') {
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
            items: this.content.items.map((item) => item.toJson()),
        };
        return {
            metadata: this.metadata,
            content,
        };
    }
    static mimetype: MimetypeNameType = 'lyric';
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Lyric(fileSource, json.metadata, json.content);
    }
    static _initItems(lyric: ItemSource<any>) {
        lyric.content.items = lyric.content.items.map((item: any) => {
            return new LyricItem(item.title, item.text);
        });
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        const lyric = await super._readFileToDataNoCache<Lyric>(fileSource,
            this.validate, this._instantiate);
        if (lyric) {
            this._initItems(lyric);
        }
        return lyric;
    }
    static async readFileToData(fileSource: FileSource | null) {
        const lyric = await super._readFileToData<Lyric>(fileSource,
            this.validate, this._instantiate);
        if (lyric) {
            this._initItems(lyric);
        }
        return lyric;
    }
    static present(lyric: Lyric | null) {
        if (lyric === null) {
            this.setSelectedFileSource(null);
        } else {
            setSetting('selected-lyric', lyric.fileSource.filePath);
        }
        previewingEventListener.presentLyric(lyric);
    }
    static async getSelected() {
        const fileSource = this.getSelectedFileSource();
        if (fileSource !== null) {
            return Lyric.readFileToData(fileSource);
        }
        return null;
    }
    static getDefaultList() {
        let defaultLyricList = [];
        try {
            const str = getSetting('lyric-list');
            defaultLyricList = JSON.parse(str);
        } catch (error) { }
        return defaultLyricList;
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
}
