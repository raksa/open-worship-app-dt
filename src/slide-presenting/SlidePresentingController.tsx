import './SlidePresentingController.scss';

import SlideItemThumbList from './SlideItemThumbList';
import { renderFG } from '../helper/presentingHelpers';
import { useSlideItemThumbSelecting, useThumbSizing } from '../event/SlideListEventListener';
import { presentEventListener } from '../event/PresentEventListener';
import SlideThumbsController, { DEFAULT_THUMB_SIZE, MAX_THUMB_SCALE, MIN_THUMB_SCALE, THUMB_SCALE_STEP, THUMB_WIDTH_SETTING_NAME } from './SlideThumbsController';

export default function SlidePresentingController() {
    const [thumbSize, setThumbSize] = useThumbSizing(THUMB_WIDTH_SETTING_NAME, DEFAULT_THUMB_SIZE);
    useSlideItemThumbSelecting((item) => {
        if (item !== null) {
            renderFG(item.html);
            presentEventListener.renderFG();
        } else {
            presentEventListener.clearFG();
        }
    });
    return (
        <div id="slide-presenting-controller" className="card w-100 h-100">
            <div className="card-body w-100 h-100">
                <SlideItemThumbList />
            </div>
            <Footer thumbSize={thumbSize} setThumbSize={(s) => setThumbSize(s)} />
        </div>
    );
}

function Footer({ thumbSize, setThumbSize }: {
    thumbSize: number, setThumbSize: (size: number) => void,
}) {
    const currentScale = (thumbSize / DEFAULT_THUMB_SIZE);
    return (
        <div className="card-footer">
            <div className="d-flex justify-content-end h-100">
                <div className='size d-flex'>
                    <label className="form-label">Size:{currentScale.toFixed(1)}</label>
                    <input type="range" className="form-range" min={MIN_THUMB_SCALE} max={MAX_THUMB_SCALE}
                        step={THUMB_SCALE_STEP} value={currentScale.toFixed(1)} onChange={(e) => {
                            setThumbSize((+e.target.value) * DEFAULT_THUMB_SIZE);
                        }} onWheel={(e) => {
                            const newScale = SlideThumbsController.toScaleThumbSize(e.deltaY > 0, currentScale);
                            setThumbSize(newScale * DEFAULT_THUMB_SIZE);
                        }} />
                </div>
            </div>
        </div>
    );
}
