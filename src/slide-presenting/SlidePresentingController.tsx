import './SlidePresentingController.scss';

import SlideItemThumbList from './SlideItemThumbList';
import { clearFG, renderFG } from './slidePresentHelpers';
import { useEffect } from 'react';
import { useSlideItemThumbSelecting } from '../event/SlideListEventListener';
import { presentEventListener } from '../event/PresentEventListener';
import { useStateSettingNumber } from '../helper/settingHelper';

const defaultThumbSize = 250;
export default function SlidePresentingController() {
    const [thumbSize, setThumbSize] = useStateSettingNumber('presenting-item-thumb-size', defaultThumbSize);
    useEffect(() => {
        return () => {
            clearFG();
        };
    });
    useEffect(() => {
        return () => {
            clearFG();
        };
    });
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
                <SlideItemThumbList thumbWidth={thumbSize} />
            </div>
            <Footer thumbSize={thumbSize} setThumbSize={(s) => setThumbSize(s)} />
        </div>
    );
}

function Footer({ thumbSize, setThumbSize }: {
    thumbSize: number, setThumbSize: (size: number) => void,
}) {
    let v = (thumbSize / defaultThumbSize);
    return (
        <div className="card-footer">
            <div className="d-flex justify-content-end h-100">
                <div className='size d-flex'>
                    <label className="form-label">Size:{v.toFixed(1)}</label>
                    <input type="range" className="form-range" min={1} max={3} step={0.2}
                        value={v.toFixed(1)} onChange={(e) => {
                            setThumbSize((+e.target.value) * defaultThumbSize);
                        }} onWheel={(e) => {
                            const isUp = e.deltaY > 0;
                            let newScale = v += (isUp ? -1 : 1) * 0.2;
                            if (newScale < 1) {
                                newScale = 1;
                            }
                            if (newScale > 3) {
                                newScale = 3;
                            }
                            setThumbSize(newScale * defaultThumbSize);
                        }} />
                </div>
            </div>
        </div>
    );
}
