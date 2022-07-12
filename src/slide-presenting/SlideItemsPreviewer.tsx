import {
    useSlideItemSizing,
} from '../event/SlideListEventListener';
import SlideItems from './SlideItems';
import {
    DEFAULT_THUMBNAIL_SIZE,
    THUMBNAIL_WIDTH_SETTING_NAME,
} from '../slide-list/slideHelpers';
import Slide from '../slide-list/Slide';

export default function SlideItemsPreviewer({ slide }: { slide: Slide }) {
    const [thumbSize, setThumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    return (
        <div className='w-100 h-100' style={{ overflow: 'auto' }}
            onWheel={(e) => {
                if (!e.ctrlKey) {
                    return;
                }
                const currentScale = (thumbSize / DEFAULT_THUMBNAIL_SIZE);
                const newScale = Slide.toScaleThumbSize(e.deltaY > 0, currentScale);
                setThumbSize(newScale * DEFAULT_THUMBNAIL_SIZE);
            }}
            onContextMenu={(e) => slide.showSlideItemContextMenu(e)}
            onPaste={() => slide.pasteItem()}>
            <SlideItems slide={slide} />
        </div>
    );
}
