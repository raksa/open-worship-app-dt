import './SlidePreviewer.scss';

import { useCallback, useState } from 'react';

import SlideItemsPreviewer from './SlideItemsPreviewer';
import { useSlideItemSizing } from '../../event/SlideListEventListener';
import {
    THUMBNAIL_WIDTH_SETTING_NAME, DEFAULT_THUMBNAIL_SIZE, SlideDynamicType,
} from '../../slide-list/slideHelpers';
import SlidePreviewerFooter from './SlidePreviewerFooter';
import Slide from '../../slide-list/Slide';
import { useSlideSelecting } from '../../event/PreviewingEventListener';
import SlideItemsMenu from './SlideItemsMenu';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import { useAppEffect } from '../../helper/debuggerHelpers';

export default function SlidePreviewer() {
    const [thumbSize, setThumbSize] = useSlideItemSizing(
        THUMBNAIL_WIDTH_SETTING_NAME, DEFAULT_THUMBNAIL_SIZE);
    const [slide, setSlide] = useState<SlideDynamicType>(null);
    const setThumbnailSizeCallback = useCallback((newSize: number) => {
        setThumbSize(newSize);
    }, [setThumbSize]);
    useSlideSelecting(() => {
        setSlide(null);
    });
    const reloadSlide = async () => {
        const newSlide = await Slide.getSelected();
        setSlide(newSlide || undefined);
    };
    useAppEffect(() => {
        if (slide === null) {
            reloadSlide();
        }
    }, [slide]);
    useFSEvents(['delete', 'update'],
        slide?.filePath, () => {
            setSlide(null);
        });
    if (!slide) {
        return (
            <div className='alert alert-warning'>
                "Node Slide Selected" please select one!
            </div>
        );
    }
    return (
        <div id='slide-previewer'
            className='card w-100 h-100'>
            {previewSlide(slide)}
            <SlidePreviewerFooter
                thumbnailSize={thumbSize}
                setThumbnailSize={setThumbnailSizeCallback}
                slide={slide} />
        </div>
    );
}

function previewSlide(slide: Slide) {
    return (
        <div className='card-body w-100 h-100 overflow-hidden'>
            {!slide.isPdf && <SlideItemsMenu slide={slide} />}
            <SlideItemsPreviewer slide={slide} />
        </div>
    );
}
