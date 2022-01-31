import { useState } from 'react';
import fullTextPresentHelper from './fullTextPresentHelper';

export default function ScrollController() {
    const [moveUp, setMoveUp] = useState(0);
    return (
        <div className="scroll-manager card ms-2" onWheel={(e) => {
            e.stopPropagation();
            let unit = 30;
            if (e.ctrlKey) {
                unit += 30;
                if (e.shiftKey) {
                    unit += 60;
                }
            } else if (e.shiftKey) {
                unit += 60;
            }
            const isUp = e.deltaY > 0;
            setMoveUp(moveUp + (isUp ? 1 : -1) * unit);
            fullTextPresentHelper.setRenderScroll(unit, isUp);
        }}>
            <div className="card-header">
                Scroll Controller, [Ctrl] | [Shift] + 🖱️scroll
            </div>
            <div className="card-body">
                <div className="inline">
                    <button className="btn btn-sm btn-info w-100" onClick={() => {
                        fullTextPresentHelper.setScrollTop();
                    }}>Top</button>
                    <div className="progress">
                        <div className="progress-bar progress-bar-striped"
                            role="progressbar" aria-valuenow={75}
                            aria-valuemin={0} aria-valuemax={100}
                            style={{ width: '100%', backgroundPositionX: `${moveUp}px` }}></div>
                    </div>
                    <button className="btn btn-sm btn-info w-100" onClick={() => {
                        fullTextPresentHelper.setScrollBottom();
                    }}>Bottom</button>
                </div>
            </div>
        </div>
    );
}
