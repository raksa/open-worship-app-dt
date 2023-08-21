export enum DragTypeEnum {
    // eslint-disable-next-line no-unused-vars
    UNKNOWN = 'unknown',
    // eslint-disable-next-line no-unused-vars
    SLIDE_ITEM = 'slideItem',
    // eslint-disable-next-line no-unused-vars
    BIBLE_ITEM = 'bibleItem',
    // eslint-disable-next-line no-unused-vars
    LYRIC_ITEM = 'lyricItem',
    // eslint-disable-next-line no-unused-vars
    BG_VIDEO = 'bg-video',
    // eslint-disable-next-line no-unused-vars
    BG_IMAGE = 'bg-image',
    // eslint-disable-next-line no-unused-vars
    BG_COLOR = 'bg-color',
};

export type DragDataType<T> = {
    type: DragTypeEnum;
    data: T;
};

export type DroppedDataType = {
    type: DragTypeEnum;
    item: any;
};

interface DragInf<T> {
    dragSerialize(type?: DragTypeEnum): DragDataType<T>;
}

export default DragInf;
