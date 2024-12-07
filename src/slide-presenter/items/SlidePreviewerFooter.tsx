import { useState } from 'react';

import { PathPreviewer } from '../../others/PathPreviewer';
import { useSelectedSlideContext } from '../../slide-list/Slide';
import {
    MIN_THUMBNAIL_SCALE, MAX_THUMBNAIL_SCALE, THUMBNAIL_SCALE_STEP,
} from '../../slide-list/slideHelpers';
import { usePSlideMEvents } from '../../_screen/screenEventHelpers';
import { getPresenterIndex } from './slideItemHelpers';
import AppRange from '../../others/AppRange';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';


function HistoryPreviewerFooter() {
    const { selectedSlide } = useSelectedSlideContext();
    const [history, setHistory] = useState<number[]>([]);
    usePSlideMEvents(['update'], undefined, () => {
        const index = getPresenterIndex(selectedSlide);
        if (index < 0) {
            return;
        }
        setHistory((oldHistory) => {
            const newHistory = [...oldHistory, index + 1];
            if (newHistory.length > 3) {
                newHistory.shift();
            }
            return newHistory;
        });
    });
    return (
        <div className='history me-1'>
            <span className='badge rounded-pill text-bg-info'>
                {history.join(', ')}
            </span>
        </div>
    );
}

function choseNewSlide(event: any) {
    console.log('choseNewSlide', event);
}

export const defaultRangeSize = {
    size: MIN_THUMBNAIL_SCALE,
    min: MIN_THUMBNAIL_SCALE,
    max: MAX_THUMBNAIL_SCALE,
    step: THUMBNAIL_SCALE_STEP,
};
export default function SlidePreviewerFooter() {
    const { selectedSlide } = useSelectedSlideContext();
    const [
        thumbnailSizeScale, setThumbnailSizeScale,
    ] = useSlideItemThumbnailSizeScale();
    return (
        <div className='card-footer w-100'>
            <div className='d-flex w-100 h-100'>
                <div className='flex-item'>
                    <AppRange value={thumbnailSizeScale}
                        title='SlideItem Thumbnail Size Scale'
                        setValue={setThumbnailSizeScale}
                        defaultSize={defaultRangeSize}
                    />
                    <PathPreviewer
                        dirPath={selectedSlide.filePath}
                        isShowingNameOnly
                        onClick={(event) => {
                            choseNewSlide(event);
                        }}
                    />
                </div>
                <div className='flex-item'>
                    <HistoryPreviewerFooter />
                </div>
            </div>
        </div>
    );
}
