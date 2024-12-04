import './SlidePreviewer.scss';

import { useState } from 'react';

import SlideItemsPreviewer from './SlideItemsPreviewer';
import {
    SlideDynamicType,
} from '../../slide-list/slideHelpers';
import SlidePreviewerFooter from './SlidePreviewerFooter';
import Slide from '../../slide-list/Slide';
import { useSlideSelecting } from '../../event/PreviewingEventListener';
import SlideItemsMenu from './SlideItemsMenu';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import { useAppEffect } from '../../helper/debuggerHelpers';

export default function SlidePreviewer() {
    const [slide, setSlide] = useState<SlideDynamicType>(null);
    useSlideSelecting(() => {
        setSlide(null);
    });
    useAppEffect(async () => {
        if (slide === null) {
            const newSlide = await Slide.getSelected();
            setSlide(newSlide || undefined);
        }
    }, [slide]);
    useFSEvents(['delete', 'update'], slide?.filePath, () => {
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
            <div className='card-body w-100 h-100 overflow-hidden'>
                {!slide.isPdf && <SlideItemsMenu slide={slide} />}
                <SlideItemsPreviewer slide={slide} />
            </div>
            <SlidePreviewerFooter slide={slide} />
        </div>
    );
}
