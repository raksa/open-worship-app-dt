import {
    slideListEventListenerGlobal,
} from '../event/SlideListEventListener';
import Slide from '../slide-list/Slide';
import Canvas from '../slide-editor/canvas/Canvas';
import SlideItem from '../slide-list/SlideItem';
import { useReadFileToData } from '../helper/helpers';
import FileReadError from '../others/FileReadError';
import SlideItemIFrame from '../slide-presenting/items/SlideItemIFrame';

export default function PlaylistSlideItem({
    slideItemPath, width,
}: {
    slideItemPath: string | null,
    width: number,
}) {
    const result = SlideItem.extractItemSetting(slideItemPath);
    if (result === null) {
        return (
            <FileReadError />
        );
    }
    const { id, fileSource } = result;
    const slide = useReadFileToData<Slide>(fileSource);
    const item = !slide ? null :
        (slide.content.items.find((newItem) => {
            return newItem.id === id;
        }) || null);
    if (item === null) {
        return (
            <FileReadError />
        );
    }
    return (
        <div className='card overflow-hidden'
            onClick={() => {
                slideListEventListenerGlobal.selectSlideItem(item);
            }}>
            <SlideItemIFrame id={id} width={width}
                canvasDim={Canvas.parseHtmlDim(item.htmlString)} />
        </div>
    );
}
