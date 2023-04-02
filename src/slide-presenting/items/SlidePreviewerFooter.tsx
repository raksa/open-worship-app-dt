import { pathPreviewer } from '../../others/PathPreviewer';
import Slide from '../../slide-list/Slide';
import {
    DEFAULT_THUMBNAIL_SIZE,
    MIN_THUMBNAIL_SCALE,
    MAX_THUMBNAIL_SCALE,
    THUMBNAIL_SCALE_STEP,
} from '../../slide-list/slideHelpers';

export default function SlidePreviewerFooter({
    thumbnailSize, setThumbnailSize, slide,
}: {
    thumbnailSize: number,
    setThumbnailSize: (size: number) => void,
    slide: Slide,
}) {
    const currentScale = (thumbnailSize / DEFAULT_THUMBNAIL_SIZE);
    return (
        <div className='card-footer w-100'>
            <div className='d-flex w-100 h-100'>
                {pathPreviewer(slide.fileSource.filePath)}
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
