import { useState } from 'react';

import { PathPreviewerComp } from '../../others/PathPreviewerComp';
import {
    MIN_THUMBNAIL_SCALE,
    MAX_THUMBNAIL_SCALE,
    THUMBNAIL_SCALE_STEP,
    selectSlide,
    useSelectedVaryAppDocumentContext,
    useSelectedAppDocumentSetterContext,
} from '../../slide-list/appDocumentHelpers';
import { useScreenSlideManagerEvents } from '../../_screen/managers/screenEventHelpers';
import { genSlideItemIds, getPresenterIndex } from './slideItemHelpers';
import AppRangeComp from '../../others/AppRangeComp';
import { useAppDocumentItemThumbnailSizeScale } from '../../event/SlideListEventListener';
import appProvider from '../../server/appProvider';
import { showAppAlert } from '../../popup-widget/popupWidgetHelpers';

function HistoryPreviewerFooterComp() {
    const selectedVaryAppDocument = useSelectedVaryAppDocumentContext();
    const [history, setHistory] = useState<number[]>([]);
    useScreenSlideManagerEvents(['update'], undefined, async () => {
        const appVaryDocumentItems = await selectedVaryAppDocument.getItems();
        const index = getPresenterIndex(
            selectedVaryAppDocument.filePath,
            genSlideItemIds(appVaryDocumentItems),
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
        <div className="history me-1">
            <span className="badge rounded-pill text-bg-info">
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
export default function AppDocumentPreviewerFooterComp() {
    const selectedSlide = useSelectedVaryAppDocumentContext();
    const setSelectedSlide = useSelectedAppDocumentSetterContext();
    const [thumbnailSizeScale, setThumbnailSizeScale] =
        useAppDocumentItemThumbnailSizeScale();
    const handleSlideChoosing = async (event: any) => {
        const slide = await selectSlide(event, selectedSlide.filePath);
        if (slide === null) {
            showAppAlert(
                'No Slide Available',
                'No other slide found in the slide directory',
            );
        } else {
            slide.isSelected = true;
            setSelectedSlide(slide);
        }
    };
    return (
        <div className="card-footer w-100">
            <div className="d-flex w-100 h-100">
                <div className="flex-item">
                    <AppRangeComp
                        value={thumbnailSizeScale}
                        title="SlideItem Thumbnail Size Scale"
                        setValue={setThumbnailSizeScale}
                        defaultSize={defaultRangeSize}
                    />
                    <PathPreviewerComp
                        dirPath={selectedSlide.filePath}
                        isShowingNameOnly
                        onClick={handleSlideChoosing}
                    />
                </div>
                {appProvider.isPagePresenter ? (
                    <div className="flex-item">
                        <HistoryPreviewerFooterComp />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
