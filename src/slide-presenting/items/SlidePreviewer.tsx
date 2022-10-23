import './SlidePreviewer.scss';

import SlideItemsPreviewer from './SlideItemsPreviewer';
import {
    useSlideItemSizing,
} from '../../event/SlideListEventListener';
import {
    THUMBNAIL_WIDTH_SETTING_NAME,
    DEFAULT_THUMBNAIL_SIZE,
} from '../../slide-list/slideHelpers';
import SlidePreviewerFooter from './SlidePreviewerFooter';
import Slide from '../../slide-list/Slide';
import { useSlideSelecting } from '../../event/PreviewingEventListener';
import { useEffect, useState } from 'react';
import SlideList from '../../slide-list/SlideList';
import SlideItemsMenu from './SlideItemsMenu';
import { useFSEvents } from '../../helper/dirSourceHelpers';

export default function SlidePreviewer() {
    const [thumbSize, setThumbSize] = useSlideItemSizing(
        THUMBNAIL_WIDTH_SETTING_NAME, DEFAULT_THUMBNAIL_SIZE);
    const [slide, setSlide] = useState<Slide | null | undefined>(null);
    useSlideSelecting(() => {
        setSlide(null);
    });
    const reloadSlide = async () => {
        const newSlide = await Slide.getSelected();
        setSlide(newSlide || undefined);
    };
    useEffect(() => {
        if (slide === null) {
            reloadSlide();
        }
    }, [slide]);
    useFSEvents(['delete', 'update', 'refresh-dir'],
        slide?.fileSource, () => {
            setSlide(null);
        });
    if (!slide) {
        return (
            <SlideList />
        );
    }
    return (
        <div id='slide-previewer'
            className='card w-100 h-100'>
            <PreviewSlide slide={slide} />
            <SlidePreviewerFooter
                thumbnailSize={thumbSize}
                setThumbnailSize={(newSize) => {
                    setThumbSize(newSize);
                }} />
        </div>
    );
}

function PreviewSlide({ slide }: { slide: Slide }) {
    return (
        <div className='card-body w-100 h-100 overflow-hidden'>
            <SlideItemsMenu slide={slide} />
            <SlideItemsPreviewer slide={slide} />
        </div>
    );
}
