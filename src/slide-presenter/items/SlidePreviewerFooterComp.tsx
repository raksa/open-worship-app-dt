import { useState } from 'react';

import { PathPreviewer } from '../../others/PathPreviewer';
import {
    useSelectedSlideContext, useSelectedSlideSetterContext,
} from '../../slide-list/Slide';
import {
    MIN_THUMBNAIL_SCALE, MAX_THUMBNAIL_SCALE, THUMBNAIL_SCALE_STEP,
    selectSlide,
} from '../../slide-list/slideHelpers';
import { useScreenSlideManagerEvents } from '../../_screen/screenEventHelpers';
import { genSlideItemIds, getPresenterIndex } from './slideItemHelpers';
import AppRange from '../../others/AppRange';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import appProvider from '../../server/appProvider';
import { showAppAlert } from '../../alert/alertHelpers';

function HistoryPreviewerFooter() {
    const selectedSlide = useSelectedSlideContext();
    const [history, setHistory] = useState<number[]>([]);
    useScreenSlideManagerEvents(['update'], undefined, () => {
        const index = getPresenterIndex(
            selectedSlide.filePath, genSlideItemIds(selectedSlide.items),
        );
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

export const defaultRangeSize = {
    size: MIN_THUMBNAIL_SCALE,
    min: MIN_THUMBNAIL_SCALE,
    max: MAX_THUMBNAIL_SCALE,
    step: THUMBNAIL_SCALE_STEP,
};
export default function SlidePreviewerFooterComp() {
    const selectedSlide = useSelectedSlideContext();
    const setSelectedSlide = useSelectedSlideSetterContext();
    const [
        thumbnailSizeScale, setThumbnailSizeScale,
    ] = useSlideItemThumbnailSizeScale();
    const handleSlideChoosing = async (event: any) => {
        const slide = await selectSlide(
            event, selectedSlide.filePath,
        );
        if (slide === null) {
            showAppAlert(
                'No Slide Available',
                'No other slide found in the slide directory'
            );
        } else {
            slide.isSelected = true;
            setSelectedSlide(slide);
        }
    };
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
                        onClick={handleSlideChoosing}
                    />
                </div>
                {appProvider.isPagePresenter ? (
                    <div className='flex-item'>
                        <HistoryPreviewerFooter />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
