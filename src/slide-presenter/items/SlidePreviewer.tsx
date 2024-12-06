import './SlidePreviewer.scss';

import SlideItemsPreviewer from './SlideItemsPreviewer';
import SlidePreviewerFooter from './SlidePreviewerFooter';
import { useSelectedSlide } from '../../slide-list/Slide';
import SlideItemsMenu from './SlideItemsMenu';

export default function SlidePreviewer() {
    const { selectedSlide } = useSelectedSlide();
    if (!selectedSlide) {
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
                {!selectedSlide.isPdf && (
                    <SlideItemsMenu />
                )}
                <SlideItemsPreviewer />
            </div>
            <SlidePreviewerFooter />
        </div>
    );
}
