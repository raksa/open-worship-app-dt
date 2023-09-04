import {
    toShortcutKey,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { usePMEvents } from '../presentEventHelpers';
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
        <div className={`show-hide pointer ${isShowing ? 'show' : ''}`}
            onClick={() => {
                presentManager.isShowing = !isShowing;
            }}
            data-tool-tip={toShortcutKey({ key: 'F5' })}>
            <i className='bi bi-file-slides-fill' />
        </div>
    );
}
