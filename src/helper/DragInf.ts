import BibleItem from '../bible-list/BibleItem';
import appProvider from '../server/appProvider';
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

export function handleDragStart(event: any, item: DragInf<any>, type?: DragTypeEnum) {
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
    if (type === DragTypeEnum.SLIDE_ITEM) {
        const slideItem = await SlideItem.fromKey(data);
        if (slideItem !== null) {
            return {
                type,
                item: slideItem,
            };
        }
    } else if (type === DragTypeEnum.BIBLE_ITEM) {
        try {
            const bibleItem = BibleItem.fromJson(data);
            return {
                type,
                item: bibleItem,
            };
        } catch (error) {
            console.log(type, data);
            appProvider.appUtils.handleError(error);
        }
    } else if ([DragTypeEnum.BG_VIDEO, DragTypeEnum.BG_IMAGE].includes(type)) {
        return {
            type,
            item: FileSource.getInstance(data),
        };
    }
    console.log(type, data);
    return null;
}

interface DragInf<T> {
    dragSerialize(type?: DragTypeEnum): DragDataType<T>;
}

export default DragInf;
