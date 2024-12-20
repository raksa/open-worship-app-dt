import BibleItem from './BibleItem';
import { colorDeserialize } from '../others/color/colorHelpers';
import DragInf, {
    DragDataType, DragTypeEnum, DroppedDataType,
} from '../helper/DragInf';
import FileSource from '../helper/FileSource';
import Slide from '../slide-list/Slide';

export function handleDragStart(event: any, item: DragInf<any>,
    type?: DragTypeEnum) {
    const data = item.dragSerialize(type);
    event.dataTransfer.setData('text', JSON.stringify(data));
}
export function handleDrop(event: any) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    if (!data) {
        return null;
    }
    const dragData = JSON.parse(data);
    return deserializeDragData(dragData);
}

async function deserializeDragData({
    type, data,
}: DragDataType<any>): Promise<DroppedDataType | null> {
    let item: any = null;
    if (type === DragTypeEnum.SLIDE_ITEM) {
        item = await Slide.slideItemDragDeserialize(data);
    } else if (type === DragTypeEnum.BIBLE_ITEM) {
        item = BibleItem.dragDeserialize(data);
    } else if ([
        DragTypeEnum.BACKGROUND_VIDEO,
        DragTypeEnum.BACKGROUND_IMAGE,
    ].includes(type)) {
        item = FileSource.dragDeserialize(data);
    } else if (type === DragTypeEnum.BACKGROUND_COLOR) {
        item = colorDeserialize(data);
    }
    if (item === null) {
        return null;
    }
    return { type, item };
}
