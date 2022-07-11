import './SlidePreviewer.scss';

import SlideItemsPreviewer from './SlideItemsPreviewer';
import { renderFG } from '../helper/presentingHelpers';
import {
    useSlideItemSelecting,
    useSlideItemSizing,
} from '../event/SlideListEventListener';
import { presentEventListener } from '../event/PresentEventListener';
import {
    THUMBNAIL_WIDTH_SETTING_NAME,
    DEFAULT_THUMBNAIL_SIZE,
} from '../slide-list/slideHelpers';
import SlidePreviewerFooter from './SlidePreviewerFooter';
import Slide from '../slide-list/Slide';
import { useSlideSelecting } from '../event/PreviewingEventListener';
import { useEffect, useState } from 'react';
import SlideList from '../slide-list/SlideList';

export default function SlidePreviewer() {
    const [thumbSize, setThumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    const [slide, setSlide] = useState<Slide | null | undefined>(null);
    useSlideSelecting(setSlide);
    useSlideItemSelecting(() => setSlide(null));
    useSlideItemSelecting((slideItem) => {
        if (slideItem !== null) {
            renderFG(slideItem.html);
            presentEventListener.renderFG();
        } else {
            presentEventListener.clearFG();
        }
    });
    useEffect(() => {
        if (slide === null) {
            Slide.getSelected().then((sl) => {
                setSlide(sl || undefined);
            });
        }
        if (slide) {
            const registerEvent = slide.fileSource.registerEventListener(
                ['select', 'update', 'delete'], () => {
                    setSlide(null);
                });
            return () => {
                slide.fileSource.unregisterEventListener(registerEvent);
            };
        }
    }, [slide]);
    if (!slide) {
        return (
            <SlideList />
        );
    }
    return (
        <div id='slide-previewer' className='card w-100 h-100'>
            <div className='card-body w-100 h-100'>
                <SlideItemsPreviewer slide={slide} />
            </div>
            <SlidePreviewerFooter thumbnailSize={thumbSize}
                setThumbnailSize={(s) => setThumbSize(s)} />
        </div>
    );
}
