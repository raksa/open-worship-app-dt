import { useState } from 'react';
import {
    keyboardEventListener, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { usePresentHiding } from '../event/PresentEventListener';
import {
    getIsShowing,
    showWindow,
} from '../helper/appHelper';

export default function ShowHidePresent() {
    const [isShowing, setIsShowing] = useState(getIsShowing());
    const onShow = () => {
        setIsShowing(true);
        showWindow(true);
    };
    const onHide = () => {
        setIsShowing(false);
        showWindow(false);
    };
    useKeyboardRegistering({
        key: 'F5',
    }, () => {
        isShowing ? onHide() : onShow();
    });
    usePresentHiding(() => setIsShowing(false));
    return (
        <div className={`show-hide tool-tip tool-tip-fade form-check form-switch pointer ${isShowing ? 'show' : ''}`}
            onClick={() => isShowing ? onHide() : onShow()}
            data-tool-tip={keyboardEventListener.toShortcutKey({ key: 'F5' })}>
            <input className="form-check-input pointer" type="checkbox"
                checked={isShowing} onChange={() => false} />
            <i className="bi bi-file-slides-fill" />
        </div>
    );
}
