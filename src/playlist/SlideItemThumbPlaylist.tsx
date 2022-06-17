import {
    slideListEventListenerGlobal,
} from '../event/SlideListEventListener';
import Slide, { validateSlide } from '../slide-list/Slide';
import {
    SlideItemThumbIFrame,
} from '../slide-presenting/SlideItemThumbIFrame';
import HTML2React from '../slide-editing/HTML2React';
import SlideItem from '../slide-presenting/SlideItem';
import { useReadFileToData } from '../helper/helpers';
import FileReadError from '../others/FileReadError';

export default function SlideItemThumbPlaylist({
    slideItemThumbPath, width,
}: {
    slideItemThumbPath: string, width: number,
}) {
    const {
        id, fileSource,
    } = SlideItem.extractSlideItemThumbSelected(slideItemThumbPath);
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
                slideListEventListenerGlobal.selectSlideItemThumb(item);
            }}>
            <SlideItemThumbIFrame id={id} width={width}
                html2React={HTML2React.parseHTML(item.html)} />
        </div>
    );
}
