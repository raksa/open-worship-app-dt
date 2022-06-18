import './SlidePreviewer.scss';

import SlideItemList from './SlideItemList';
import { renderFG } from '../helper/presentingHelpers';
import {
    useSlideItemSelecting,
    useSlideItemSizing,
} from '../event/SlideListEventListener';
import { presentEventListener } from '../event/PresentEventListener';
import {
    THUMBNAIL_WIDTH_SETTING_NAME,
    DEFAULT_THUMBNAIL_SIZE,
} from './SlideItemsControllerBase';
import SlidePreviewerFooter from './SlidePreviewerFooter';

export default function SlidePreviewer() {
    const [thumbSize, setThumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    useSlideItemSelecting((item) => {
        if (item !== null) {
            renderFG(item.html);
            presentEventListener.renderFG();
        } else {
            presentEventListener.clearFG();
        }
    });
    return (
        <div id='slide-previewer' className='card w-100 h-100'>
            <div className='card-body w-100 h-100'>
                <SlideItemList />
            </div>
            <SlidePreviewerFooter thumbnailSize={thumbSize}
                setThumbnailSize={(s) => setThumbSize(s)} />
        </div>
    );
}
