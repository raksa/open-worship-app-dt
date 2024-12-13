import './SlidePreviewer.scss';

import SlideItemsPreviewer from './SlideItemsPreviewer';
import SlidePreviewerFooter from './SlidePreviewerFooter';
import { SelectedSlideContext } from '../../slide-list/Slide';
import SlideItemsMenu from './SlideItemsMenu';
import { use } from 'react';

export default function SlidePreviewer() {
    const selectedSlideContext = use(SelectedSlideContext);
    if (
        selectedSlideContext === null ||
        selectedSlideContext.selectedSlide === null
    ) {
        return (
            <div>No slide selected</div>
        );
    }
    return (
        <div id='slide-previewer'
            className='card w-100 h-100'>
            <div className='card-body w-100 h-100 overflow-hidden'>
                {!selectedSlideContext.selectedSlide.isPdf && (
                    <SlideItemsMenu />
                )}
                <SlideItemsPreviewer />
            </div>
            <SlidePreviewerFooter />
        </div>
    );
}
