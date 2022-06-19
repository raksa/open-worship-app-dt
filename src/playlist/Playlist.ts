import BibleItem from '../bible-list/BibleItem';
import { toastEventListener } from '../event/ToastEventListener';
import {
    MetaDataType, MimetypeNameType,
} from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { validateMeta } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import LyricItem from '../lyric-list/LyricItem';
import SlideItem from '../slide-presenting/SlideItem';
import PlaylistItem from './PlaylistItem';

export type PlaylistType = {
    items: PlaylistItem[],
}
export default class Playlist extends ItemSource<PlaylistType>{
    static validate(json: any) {
        try {
            if (!json.content || typeof json.content !== 'object'
                || !json.content.items || !(json.content.items instanceof Array)) {
                return false;
            }
            const content = json.content;
            if (!(content.items as any[]).every((item) => {
                PlaylistItem.validate(item);
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

    static mimetype: MimetypeNameType = 'playlist';
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Playlist(fileSource, json.metadata, json.content);
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return super._readFileToDataNoCache<Playlist>(fileSource,
            this.validate, this._instantiate);
    }
    static async readFileToData(fileSource: FileSource | null) {
        return super._readFileToData<Playlist>(fileSource,
            this.validate, this._instantiate);
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, {
            items: [],
        });
    }
    addFromData(dataStr: string) {
        try {
            const json = JSON.parse(dataStr);
            if (!json.filePath) {
                return false;
            }
            let item;
            if (BibleItem.validate(json)) {
                item = new PlaylistItem('bible', BibleItem.fromJson(json));
            } else if (SlideItem.validate(json)) {
                item = new PlaylistItem('slide', SlideItem.fromJson(json));
            } else if (LyricItem.validate(json)) {
                item = new PlaylistItem('lyric', SlideItem.fromJson(json));
            }
            if(item) {
                this.content.items.push(item);
            }
            return true;
        } catch (error) {
            console.log(error);
        }
        toastEventListener.showSimpleToast({
            title: 'Parsing Data',
            message: 'Fail to deserialize data',
        });
        return false;
    }
}
