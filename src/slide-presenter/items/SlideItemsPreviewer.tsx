import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItemsComp from './SlideItemsComp';
import { useSelectedSlideContext } from '../../slide-list/Slide';
import { handleCtrlWheel } from '../../others/AppRange';
import { defaultRangeSize } from './SlidePreviewerFooterComp';
import SlideItemsMenuComp from './SlideItemsMenuComp';

export default function SlideItemsPreviewer() {
    const selectedSlide = useSelectedSlideContext();
    const [
        thumbSizeScale, setThumbnailSizeScale,
    ] = useSlideItemThumbnailSizeScale();
    return (
        <div className='w-100 h-100 pb-5'
            style={{ overflow: 'auto' }}
            onWheel={(event) => {
                handleCtrlWheel({
                    event, value: thumbSizeScale,
                    setValue: setThumbnailSizeScale,
                    defaultSize: defaultRangeSize,
                });
            }}
            onContextMenu={(event) => {
                selectedSlide.showSlideItemContextMenu(event);
            }}
            onPaste={() => {
                selectedSlide.pasteItem();
            }}>
            {!selectedSlide.isPdf && (
                <SlideItemsMenuComp />
            )}
            <SlideItemsComp />
        </div>
    );
}
