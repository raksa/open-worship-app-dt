import { useState } from 'react';

import { PathPreviewerComp } from '../../others/PathPreviewerComp';
import {
    useSelectedSlideContext,
    useSelectedSlideSetterContext,
} from '../../slide-list/Slide';
import {
    MIN_THUMBNAIL_SCALE,
    MAX_THUMBNAIL_SCALE,
    THUMBNAIL_SCALE_STEP,
    selectSlide,
} from '../../slide-list/slideHelpers';
import AppRangeComp from '../../others/AppRangeComp';
import { useSlideItemThumbnailSizeScale } from '../../event/SlideListEventListener';
import appProvider from '../../server/appProvider';
import { showAppAlert } from '../../popup-widget/popupWidgetHelpers';
import SlideItem from '../../slide-list/SlideItem';
import { useAppEffect } from '../../helper/debuggerHelpers';

export const slidePreviewerMethods = {
    handleSlideItemSelected: (_viewIndex: number, _slideItem: SlideItem) => {},
};

function HistoryPreviewerFooter() {
    const [selectedSlideItemHistories, setSelectedSlideItemHistories] =
        useState<[number, string][]>([]);
    useAppEffect(() => {
        slidePreviewerMethods.handleSlideItemSelected = (
            viewIndex: number,
            slideItem: SlideItem,
        ) => {
            setSelectedSlideItemHistories((oldHistories) => {
                const newHistories = [
                    ...oldHistories,
                    [viewIndex, slideItem.key],
                ];
                while (newHistories.length > 3) {
                    newHistories.shift();
                }
                return newHistories as [number, string][];
            });
        };
        return () => {
            slidePreviewerMethods.handleSlideItemSelected = (
                _viewIndex,
                _slideItem,
            ) => {};
        };
    }, []);
    return (
        <div className="history me-1">
            {selectedSlideItemHistories.map(([index, key]) => {
                return (
                    <span
                        title={key}
                        key={key}
                        className="badge rounded-pill text-bg-info"
                    >
                        {index}
                    </span>
                );
            })}
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
    const [thumbnailSizeScale, setThumbnailSizeScale] =
        useSlideItemThumbnailSizeScale();
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
                        <HistoryPreviewerFooter />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
