import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItems from './SlideItems';
import {
    MAX_THUMBNAIL_SCALE, MIN_THUMBNAIL_SCALE, THUMBNAIL_SCALE_STEP,
} from '../../slide-list/slideHelpers';
import Slide from '../../slide-list/Slide';
import { wheelToScaleThumbnailSize } from '../../others/AppRange';

export default function SlideItemsPreviewer({ slide }: Readonly<{
    slide: Slide,
}>) {
    const [
        thumbSizeScale, setThumbnailSizeScale,
    ] = useSlideItemThumbnailSizeScale();
    return (
        <div className='w-100 h-100 pb-5'
            style={{ overflow: 'auto' }}
            onWheel={(event) => {
                if (!event.ctrlKey) {
                    return;
                }
                const newScale = wheelToScaleThumbnailSize(
                    {
                        size: MIN_THUMBNAIL_SCALE, min: MIN_THUMBNAIL_SCALE,
                        max: MAX_THUMBNAIL_SCALE, step: THUMBNAIL_SCALE_STEP,
                    },
                    event.deltaY > 0, thumbSizeScale,
                );
                setThumbnailSizeScale(newScale);
            }}
            onContextMenu={(event) => {
                slide.showSlideItemContextMenu(event);
            }}
            onPaste={() => slide.pasteItem()}>
            <SlideItems slide={slide} />
        </div>
    );
}
