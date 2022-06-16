import { fullTextPresentEventListener } from '../event/FullTextPresentEventListener';
import { genFileSource, MimetypeNameType } from './fileHelper';
import { validateMeta } from './helpers';
import ItemSource from './ItemSource';
import { setSetting, getSetting } from './settingHelper';

export type LyricItemType = {
    title: string,
    text: string,
};
export type LyricType = {
    index?: number,
    items: LyricItemType[],
}
export class Lyric extends ItemSource<LyricType>{
    static mimetype: MimetypeNameType = 'lyric';
    static validator: (json: Object) => boolean = validateLyric;
    static presentLyric(lyricItem: Lyric) {
        setSetting('selected-lyric', lyricItem.fileSource.filePath);
        fullTextPresentEventListener.presentLyric(lyricItem);
    }
    static clearLyricListEditingIndex() {
        setSetting('selected-lyric', '');
    }
    static getSelectedLyricFileSource() {
        const filePath = getSetting('selected-lyric', '');
        if (filePath) {
            return genFileSource(filePath);
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
