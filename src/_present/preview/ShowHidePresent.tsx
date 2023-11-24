import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { usePMEvents } from '../presentEventHelpers';
import PresentManager from '../PresentManager';

const presentingEventMap = { key: 'F5' };
export default function ShowHidePresent({
    presentManager,
}: Readonly<{
    presentManager: PresentManager,
}>) {
    useKeyboardRegistering([presentingEventMap], () => {
        presentManager.isShowing = !isShowing;
    });
    usePMEvents(['visible'], presentManager);
    const isShowing = presentManager.isShowing;
    return (
        <div className={`show-hide pointer ${isShowing ? 'show' : ''}`}
            onClick={() => {
                presentManager.isShowing = !isShowing;
            }}
            data-tool-tip={toShortcutKey(presentingEventMap)}>
            <i className='bi bi-file-slides-fill' />
        </div>
    );
}
