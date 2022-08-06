import {
    keyboardEventListener,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { usePMEvents } from '../presentHelpers';
import PresentManager from '../PresentManager';

export default function ShowHidePresent({
    presentManager,
}: {
    presentManager: PresentManager,
}) {
    useKeyboardRegistering({
        key: 'F5',
    }, () => {
        presentManager.isShowing = !isShowing;
    });
    usePMEvents(['visible'], presentManager);
    const isShowing = presentManager.isShowing;
    return (
        <div className={'show-hide tool-tip tool-tip-fade '
            + `form-check form-switch pointer ${isShowing ? 'show' : ''}`}
            onClick={() => {
                presentManager.isShowing = !isShowing;
            }}
            data-tool-tip={keyboardEventListener.toShortcutKey({ key: 'F5' })}>
            <input className='form-check-input pointer' type='checkbox'
                checked={isShowing}
                onChange={() => false} />
            <i className='bi bi-file-slides-fill' />
        </div>
    );
}
