import BibleItem from '../bible-list/BibleItem';
import { colorDeserialize } from '../others/color/colorHelpers';
import SlideItem from '../slide-list/SlideItem';
import FileSource from './FileSource';

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

export function handleDragStart(event: any, item: DragInf<any>,
    type?: DragTypeEnum) {
    const data = item.dragSerialize(type);
    event.dataTransfer.setData('text', JSON.stringify(data));
}
export function handleDrop(event: any) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const dragData = JSON.parse(data);
    return deserializeDragData(dragData);
}

async function deserializeDragData({
    type, data,
}: DragDataType<any>): Promise<DroppedDataType | null> {
    let item: any = null;
    if (type === DragTypeEnum.SLIDE_ITEM) {
        item = await SlideItem.dragDeserialize(data);
    } else if (type === DragTypeEnum.BIBLE_ITEM) {
        item = BibleItem.dragDeserialize(data);
    } else if ([
        DragTypeEnum.BG_VIDEO,
        DragTypeEnum.BG_IMAGE,
    ].includes(type)) {
        item = FileSource.dragDeserialize(data);
    } else if (type === DragTypeEnum.BG_COLOR) {
        item = colorDeserialize(data);
    }
    if (item === null) {
        console.log(type, data);
        return null;
    }
    return { type, item };
}

interface DragInf<T> {
    dragSerialize(type?: DragTypeEnum): DragDataType<T>;
}

export default DragInf;
