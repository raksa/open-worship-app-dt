import { useState } from 'react';

import { pathPreviewer } from '../../others/PathPreviewer';
import Slide from '../../slide-list/Slide';
import {
    DEFAULT_THUMBNAIL_SIZE, MIN_THUMBNAIL_SCALE, MAX_THUMBNAIL_SCALE,
    THUMBNAIL_SCALE_STEP,
} from '../../slide-list/slideHelpers';
import { usePSlideMEvents } from '../../_present/presentEventHelpers';
import { getPresentingIndex } from './slideItemHelpers';


function HistoryPreviewerFooter({ slide }: Readonly<{ slide: Slide }>) {
    const [history, setHistory] = useState<number[]>([]);
    usePSlideMEvents(['update'], undefined, () => {
        const index = getPresentingIndex(slide);
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

function ScalePreviewerFooter({
    thumbnailSize, setThumbnailSize,
}: Readonly<{
    thumbnailSize: number,
    setThumbnailSize: (size: number) => void,
}>) {
    const currentScale = (thumbnailSize / DEFAULT_THUMBNAIL_SIZE);
    return (
        <div className='form form-inline d-flex flex-row-reverse'
            style={{ minWidth: '100px' }}>
            <label className='form-label'>
                Size:{currentScale.toFixed(1)}
            </label>
            <input type='range' className='form-range'
                min={MIN_THUMBNAIL_SCALE} max={MAX_THUMBNAIL_SCALE}
                step={THUMBNAIL_SCALE_STEP}
                value={currentScale.toFixed(1)}
                onChange={(event) => {
                    setThumbnailSize((+event.target.value) *
                        DEFAULT_THUMBNAIL_SIZE);
                }}
                onWheel={(event) => {
                    const newScale = Slide.toScaleThumbSize(
                        event.deltaY > 0, currentScale);
                    setThumbnailSize(newScale * DEFAULT_THUMBNAIL_SIZE);
                }} />
        </div>
    );
}

export default function SlidePreviewerFooter({
    thumbnailSize, setThumbnailSize, slide,
}: Readonly<{
    thumbnailSize: number,
    setThumbnailSize: (size: number) => void,
    slide: Slide,
}>) {
    return (
        <div className='card-footer w-100'>
            <div className='d-flex w-100 h-100'>
                <HistoryPreviewerFooter slide={slide} />
                {pathPreviewer(slide.filePath)}
                <ScalePreviewerFooter
                    thumbnailSize={thumbnailSize}
                    setThumbnailSize={setThumbnailSize}
                />
            </div>
        </div>
    );
}
