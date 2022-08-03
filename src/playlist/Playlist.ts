import { toastEventListener } from '../event/ToastEventListener';
import { MimetypeNameType } from '../server/fileHelper';
import FileSource from '../helper/FileSource';
import { AnyObjectType } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import PlaylistItem, { PlaylistItemType } from './PlaylistItem';

export type PlaylistType = {
    items: PlaylistItemType[],
    metadata: AnyObjectType,
}

export default class Playlist extends ItemSource<PlaylistItem>{
    static SELECT_DIR_SETTING = 'playlist-list-selected-dir';
    static mimetype: MimetypeNameType = 'playlist';
    _originalJson: PlaylistType;
    constructor(fileSource: FileSource, json: PlaylistType) {
        super(fileSource);
        this._originalJson = json;
    }
    static fromJson(fileSource: FileSource, json: PlaylistType) {
        this.validate(json);
        return new Playlist(fileSource, json);
    }
    get metadata() {
        return this._originalJson.metadata;
    }
    get items() {
        return this._originalJson.items.map((json) => {
            try {
                return PlaylistItem.fromJson(this.fileSource, json);
            } catch (error: any) {
                toastEventListener.showSimpleToast({
                    title: 'Instantiating Playlist Item',
                    message: error.message,
                });
            }
            return PlaylistItem.fromJsonError(this.fileSource, json);
        });
    }
    get maxItemId() {
        return 0;
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return super.readFileToDataNoCache(fileSource) as
            Promise<Playlist | null | undefined>;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        return super.readFileToData(fileSource, isForceCache) as
            Promise<Playlist | null | undefined>;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, []);
    }
    addFromData(dataStr: string) {
        try {
            const json = JSON.parse(dataStr);
            const item = PlaylistItem.fromJson(this.fileSource, json);
            this._originalJson.items.push(item.toJson());
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Adding Playlist Item',
                message: error.message,
            });
        }
        return false;
    }
    toJson(): PlaylistType {
        return this._originalJson;
    }
}
