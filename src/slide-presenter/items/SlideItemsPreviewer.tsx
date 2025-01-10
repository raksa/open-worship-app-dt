import { useSlideItemThumbnailSizeScale } from '../../event/SlideListEventListener';
import SlideItemsComp from './SlideItemsComp';
import Slide, { useSelectedSlideContext } from '../../slide-list/Slide';
import { handleCtrlWheel } from '../../others/AppRangeComp';
import { defaultRangeSize } from './SlidePreviewerFooterComp';
import SlideItemsMenuComp from './SlideItemsMenuComp';
import { DIV_CLASS_NAME } from './slideItemHelpers';

export default function SlideItemsPreviewer() {
    const selectedSlide = useSelectedSlideContext();
    const [thumbSizeScale, setThumbnailSizeScale] =
        useSlideItemThumbnailSizeScale();
    return (
        <div
            className={`${DIV_CLASS_NAME} app-focusable w-100 h-100 pb-5`}
            tabIndex={0}
            style={{ overflow: 'auto' }}
            onWheel={(event) => {
                handleCtrlWheel({
                    event,
                    value: thumbSizeScale,
                    setValue: setThumbnailSizeScale,
                    defaultSize: defaultRangeSize,
                });
            }}
            onContextMenu={(event) => {
                selectedSlide.showSlideItemContextMenu(event);
            }}
            onPaste={async () => {
                const copiedSlideItems = await Slide.getCopiedSlideItems();
                for (const copiedSlideItem of copiedSlideItems) {
                    selectedSlide.addItem(copiedSlideItem);
                }
            }}
        >
            {!selectedSlide.isPdf && <SlideItemsMenuComp />}
            <SlideItemsComp />
        </div>
    );
}
