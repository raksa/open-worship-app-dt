import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItems from './SlideItems';
import { useSelectedSlide } from '../../slide-list/Slide';
import { handleCtrlWheel } from '../../others/AppRange';
import { defaultRangeSize } from './SlidePreviewerFooter';

export default function SlideItemsPreviewer() {
    const { selectedSlide } = useSelectedSlide();
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
            <SlideItems />
        </div>
    );
}
