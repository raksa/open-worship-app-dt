import BibleItem from './BibleItem';
import SlideItem from '../slide-list/SlideItem';
import { colorDeserialize } from '../others/color/colorHelpers';
import DragInf, {
    DragDataType, DragTypeEnum, DroppedDataType,
} from '../helper/DragInf';
import FileSource from '../helper/FileSource';

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
        item = await SlideItem.slideItemDragDeserialize(data);
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
        return null;
    }
    return { type, item };
}
