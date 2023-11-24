import { useState } from 'react';
import { pathPreviewer } from '../../others/PathPreviewer';
import Slide from '../../slide-list/Slide';
import {
    DEFAULT_THUMBNAIL_SIZE, MIN_THUMBNAIL_SCALE, MAX_THUMBNAIL_SCALE,
    THUMBNAIL_SCALE_STEP,
} from '../../slide-list/slideHelpers';
import { usePSlideMEvents } from '../../_present/presentEventHelpers';
import PresentSlideManager from '../../_present/PresentSlideManager';

export default function SlidePreviewerFooter({
    thumbnailSize, setThumbnailSize, slide,
}: Readonly<{
    thumbnailSize: number,
    setThumbnailSize: (size: number) => void,
    slide: Slide,
}>) {
    const [history, setHistory] = useState<number[]>([]);
    usePSlideMEvents(['update'], undefined, () => {
        const dataList = PresentSlideManager.getDataList(slide.filePath);
        if (dataList.length > 0) {
            setHistory((oldHistory) => {
                return [
                    ...dataList.map((data) => {
                        return data[1]['slideItemJson']['id'] + 1;
                    }),
                    ...oldHistory,
                ];
            });
        }
    });
    const currentScale = (thumbnailSize / DEFAULT_THUMBNAIL_SIZE);
    return (
        <div className='card-footer w-100'>
            <div className='d-flex w-100 h-100'>
                <div className='history border-white-round pointer me-1'
                    onClick={() => {
                        setHistory([]);
                    }}>
                    {history.join(', ')}
                </div>
                {pathPreviewer(slide.filePath)}
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
            </div>
        </div>
    );
}
