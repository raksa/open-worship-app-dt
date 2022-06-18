import {
    slideListEventListenerGlobal,
} from '../event/SlideListEventListener';
import Slide, { validateSlide } from '../slide-list/Slide';
import HTML2React from '../slide-editor/HTML2React';
import SlideItem from '../slide-presenting/SlideItem';
import { useReadFileToData } from '../helper/helpers';
import FileReadError from '../others/FileReadError';
import SlideItemIFrame from '../slide-presenting/SlideItemIFrame';

export default function PlaylistSlideItem({
    slideItemPath, width,
}: {
    slideItemPath: string, width: number,
}) {
    const {
        id, fileSource,
    } = SlideItem.extractSlideItemSelected(slideItemPath);
    const slide = useReadFileToData<Slide>(fileSource, validateSlide);
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
                html2React={HTML2React.parseHTML(item.html)} />
        </div>
    );
}
