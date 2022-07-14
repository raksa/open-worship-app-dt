import Slide from '../../slide-list/Slide';
import {
    DEFAULT_THUMBNAIL_SIZE,
    MIN_THUMBNAIL_SCALE,
    MAX_THUMBNAIL_SCALE,
    THUMBNAIL_SCALE_STEP,
} from '../../slide-list/slideHelpers';

export default function SlidePreviewerFooter({ thumbnailSize, setThumbnailSize }: {
    thumbnailSize: number,
    setThumbnailSize: (size: number) => void,
}) {
    const currentScale = (thumbnailSize / DEFAULT_THUMBNAIL_SIZE);
    return (
        <div className='card-footer'>
            <div className='d-flex justify-content-end h-100'>
                <div className='size d-flex'>
                    <label className='form-label'>Size:{currentScale.toFixed(1)}</label>
                    <input type='range' className='form-range'
                        min={MIN_THUMBNAIL_SCALE} max={MAX_THUMBNAIL_SCALE}
                        step={THUMBNAIL_SCALE_STEP}
                        value={currentScale.toFixed(1)}
                        onChange={(e) => {
                            setThumbnailSize((+e.target.value) * DEFAULT_THUMBNAIL_SIZE);
                        }} onWheel={(e) => {
                            const newScale = Slide.toScaleThumbSize(e.deltaY > 0,
                                currentScale);
                            setThumbnailSize(newScale * DEFAULT_THUMBNAIL_SIZE);
                        }} />
                </div>
            </div>
        </div>
    );
}
