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
import { useAppEffectAsync } from '../../helper/debuggerHelpers';

export default function SlidePreviewer() {
    const [slide, setSlide] = useState<SlideDynamicType>(null);
    useSlideSelecting(() => {
        setSlide(null);
    });
    useAppEffectAsync(async (methodContext) => {
        if (slide === null) {
            const newSlide = await Slide.getSelected();
            methodContext.setSlide(newSlide || undefined);
        }
    }, [slide], { methods: { setSlide } });
    useFSEvents(['delete', 'update'], slide?.filePath, () => {
        setSlide(null);
    });
    if (!slide) {
        return (
            <div className='alert alert-warning'>
                "No Slide Selected" please select one!
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
