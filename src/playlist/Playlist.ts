import { toastEventListener } from '../event/ToastEventListener';
import { MimetypeNameType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { AnyObjectType } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import PlaylistItem from './PlaylistItem';

export type PlaylistType = {
    items: PlaylistItem[],
}
export default class Playlist extends ItemSource<PlaylistType>{
    static SELECT_DIR_SETTING = 'playlist-list-selected-dir';
    static mimetype: MimetypeNameType = 'playlist';
    static fromJson(json: AnyObjectType, fileSource: FileSource) {
        this.validate(json);
        return new Playlist(fileSource, json.metadata, json.content);
    }
    get items() {
        return this.content.items;
    }
    itemFromJson(json: AnyObjectType) {
        return PlaylistItem.fromJson(json, this.fileSource);
    }
    itemFromJsonError(json: AnyObjectType) {
        return PlaylistItem.fromJsonError(json, this.fileSource);
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return super.readFileToDataNoCache(fileSource) as Promise<Playlist | null | undefined>;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        return super.readFileToData(fileSource, isForceCache) as Promise<Playlist | null | undefined>;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, {
            items: [],
        });
    }
    addFromData(dataStr: string) {
        try {
            const json = JSON.parse(dataStr);
            const item = PlaylistItem.fromJson(json, this.fileSource);
            this.content.items.push(item);
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Adding Playlist Item',
                message: error.message,
            });
        }
        return false;
    }
}
