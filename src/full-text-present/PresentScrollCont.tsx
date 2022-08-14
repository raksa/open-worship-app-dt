import './PresentScrollCont.scss';

import { useState } from 'react';
import fullTextPresentHelper from '../_present/fullTextPresentHelper';

export default function PresentScrollCont() {
    const [moveUp, setMoveUp] = useState(0);
    return (
        <div className='present-scroll-controller card'
            onWheel={(event) => {
                event.stopPropagation();
                let unit = 30;
                if (event.ctrlKey) {
                    unit += 30;
                    if (event.shiftKey) {
                        unit += 60;
                    }
                } else if (event.shiftKey) {
                    unit += 60;
                }
                const isUp = event.deltaY > 0;
                setMoveUp(moveUp + (isUp ? 1 : -1) * unit);
                fullTextPresentHelper.setRenderScroll(unit, isUp);
            }}>
            <div className='card-body'
                title='Scroll Controller, [Ctrl] | [Shift] + 🖱️scroll'>
                <div className='inline'>
                    <button className='btn btn-sm btn-info w-100'
                        onClick={() => {
                            fullTextPresentHelper.setScrollTop();
                        }}>Top</button>
                    <div className='progress'>
                        <div className='progress-bar progress-bar-striped'
                            role='progressbar' aria-valuenow={75}
                            aria-valuemin={0} aria-valuemax={100}
                            style={{
                                width: '100%',
                                backgroundPositionX: `${moveUp}px`,
                            }}></div>
                    </div>
                    <button className='btn btn-sm btn-info w-100'
                        onClick={() => {
                            fullTextPresentHelper.setScrollBottom();
                        }}>Bottom</button>
                </div>
            </div>
        </div>
    );
}
