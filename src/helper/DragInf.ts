export enum DragTypeEnum {
    UNKNOWN = 'unknown',
    SLIDE_ITEM = 'slideItem',
    BIBLE_ITEM = 'bibleItem',
    LYRIC_ITEM = 'lyricItem',
    BACKGROUND_VIDEO = 'bg-video',
    BACKGROUND_SOUND = 'bg-sound',
    BACKGROUND_IMAGE = 'bg-image',
    BACKGROUND_COLOR = 'bg-color',
}

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
