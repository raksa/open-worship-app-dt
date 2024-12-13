export enum DragTypeEnum {
    UNKNOWN = 'unknown',
    SLIDE_ITEM = 'slideItem',
    BIBLE_ITEM = 'bibleItem',
    LYRIC_ITEM = 'lyricItem',
    BG_VIDEO = 'bg-video',
    BG_SOUND = 'bg-sound',
    BG_IMAGE = 'bg-image',
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
