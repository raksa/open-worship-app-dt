import BibleItem from '../bible-list/BibleItem';
import { colorDeserialize } from '../others/color/colorHelpers';
import DragInf, {
    DragDataType,
    DragTypeEnum,
    DroppedDataType,
} from './DragInf';
import FileSource from './FileSource';
import { appDocumentItemFromKey } from '../app-document-list/appDocumentHelpers';
import PdfSlide from '../app-document-list/PdfSlide';

export function handleDragStart(
    event: any,
    item: DragInf<any>,
    type?: DragTypeEnum,
) {
    const data = item.dragSerialize(type);
    event.dataTransfer.setData('text', JSON.stringify(data));
}

export function extractDropData(event: any) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    if (!data) {
        return null;
    }
    const dragData = JSON.parse(data);
    return deserializeDragData(dragData);
}

async function deserializeDragData({
    type,
    data,
}: DragDataType<any>): Promise<DroppedDataType | null> {
    let item: any = null;
    if (type === DragTypeEnum.SLIDE) {
        const droppedData = JSON.parse(data);
        item = await appDocumentItemFromKey(droppedData.key);
    } else if (type === DragTypeEnum.PDF_SLIDE) {
        const droppedData = JSON.parse(data);
        if (PdfSlide.tryValidate(droppedData.data)) {
            item = new PdfSlide(droppedData.filePath, droppedData.data);
        }
    } else if (type === DragTypeEnum.BIBLE_ITEM) {
        item = BibleItem.dragDeserialize(data);
    } else if (
        [DragTypeEnum.BACKGROUND_VIDEO, DragTypeEnum.BACKGROUND_IMAGE].includes(
            type,
        )
    ) {
        item = FileSource.dragDeserialize(data);
    } else if (type === DragTypeEnum.BACKGROUND_COLOR) {
        item = colorDeserialize(data);
    }
    if (item === null) {
        return null;
    }
    return { type, item };
}
