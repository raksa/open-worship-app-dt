import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../server/fileHelpers';
import { AnyObjectType } from '../helper/helpers';
import AppDocumentSourceAbs from '../helper/DocumentSourceAbs';
import LyricItem, { LyricItemType } from './LyricItem';
import ItemSourceInf from '../others/ItemSourceInf';
import { OptionalPromise } from '../others/otherHelpers';

export type LyricEditorHistoryType = {
    items?: LyricItemType[];
    metadata?: AnyObjectType;
};

export type LyricType = {
    items: LyricItemType[];
    metadata: AnyObjectType;
};
export default class Lyric
    extends AppDocumentSourceAbs
    implements ItemSourceInf<LyricItem>
{
    static readonly mimetypeName: MimetypeNameType = 'lyric';
    static readonly SELECT_SETTING_NAME = 'lyric-selected';
    SELECT_SETTING_NAME = 'lyric-selected';
    constructor(filePath: string) {
        super(filePath);
    }
    getMetadata(): OptionalPromise<AnyObjectType> {
        throw new Error('Method not implemented.');
    }
    setMetadata(_metaData: AnyObjectType): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }
    setItems(_items: LyricItem[]): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }
    getItemByIndex(_index: number): OptionalPromise<LyricItem | null> {
        throw new Error('Method not implemented.');
    }
    getItemById(_id: number): OptionalPromise<LyricItem | null> {
        throw new Error('Method not implemented.');
    }
    setItemById(_id: number, _item: LyricItem): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }
    showContextMenu(_event: any): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }
    showItemContextMenu(_event: any, _item: LyricItem): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }

    async getItems() {
        return [];
    }

    async getMaxItemId() {
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
        this.fileSource.fireSelectEvent();
    }
    static fromJson(filePath: string, json: any) {
        this.validate(json);
        return new Lyric(filePath);
    }

    static async create(dir: string, name: string) {
        return super.create(dir, name, [LyricItem.genDefaultLyric(name)]);
    }
    addItem(_lyricItem: LyricItem) {
        throw new Error('Method not implemented.');
    }
    deleteItem(_lyricItem: LyricItem) {
        throw new Error('Method not implemented.');
    }
    async save(): Promise<boolean> {
        return false;
    }

    toJson(): LyricType {
        throw new Error('Method not implemented.');
    }

    clone() {
        return Lyric.fromJson(this.filePath, this.toJson());
    }
}
