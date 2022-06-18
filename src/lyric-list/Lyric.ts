import { previewingEventListener } from '../event/PreviewingEventListener';
import { MetaDataType, MimetypeNameType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { validateMeta } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { setSetting, getSetting } from '../helper/settingHelper';

export type LyricItemType = {
    title: string,
    text: string,
};
export type LyricType = {
    index?: number,
    items: LyricItemType[],
}
export default class Lyric extends ItemSource<LyricType>{
    get isSelected() {
        const selectedFS = Lyric.getSelectedLyricFileSource();
        return this.fileSource.filePath === selectedFS?.filePath;
    }
    static mimetype: MimetypeNameType = 'lyric';
    static validator: (json: Object) => boolean = validateLyric;
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Lyric(fileSource, json.metadata, json.content);
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return ItemSource._readFileToDataNoCache<Lyric>(fileSource,
            validateLyric, this._instantiate);
    }
    static async readFileToData(fileSource: FileSource | null) {
        return ItemSource._readFileToData<Lyric>(fileSource,
            validateLyric, this._instantiate);
    }
    static presentLyric(lyric: Lyric | null) {
        if (lyric === null) {
            this.clearSelectedLyric();
        } else {
            setSetting('selected-lyric', lyric.fileSource.filePath);
        }
        previewingEventListener.presentLyric(lyric);
    }
    static clearSelectedLyric() {
        setSetting('selected-lyric', '');
    }
    static getSelectedLyricFileSource() {
        const filePath = getSetting('selected-lyric', '');
        if (filePath) {
            return FileSource.genFileSource(filePath);
        }
        return null;
    }
    static async getSelectedLyric() {
        const fileSource = this.getSelectedLyricFileSource();
        if (fileSource !== null) {
            return Lyric.readFileToData(fileSource);
        }
        return null;
    }
    static getDefaultLyricList() {
        let defaultLyricList = [];
        try {
            const str = getSetting('lyric-list');
            defaultLyricList = JSON.parse(str);
        } catch (error) { }
        return defaultLyricList;
    }
    static toNewLyric(name: string) {
        return {
            title: name,
            text: `Block1
===
Block2
===
Block3`,
        };
    }
}

function validateLyricItem(item: any) {
    try {
        if (item.title !== undefined && item.text !== undefined) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validateLyric(json: any) {
    try {
        if (!json.content || typeof json.content !== 'object'
            || !json.content.items || !(json.content.items instanceof Array)) {
            return false;
        }
        const content = json.content;
        if (!(content.items as any[]).every((item) => {
            return validateLyricItem(item);
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
