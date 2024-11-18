import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { usePMEvents } from '../screenEventHelpers';
import { useScreenManager } from '../ScreenManager';

const showingScreenEventMap = { key: 'F5' };
export default function ShowHideScreen() {
    const screenManager = useScreenManager();
    useKeyboardRegistering([showingScreenEventMap], () => {
        screenManager.isShowing = !isShowing;
    });
    usePMEvents(['visible'], screenManager);
    const isShowing = screenManager.isShowing;
    return (
        <div className={`show-hide pointer ${isShowing ? 'show' : ''}`}
            onClick={() => {
                screenManager.isShowing = !isShowing;
            }}
            data-tool-tip={toShortcutKey(showingScreenEventMap)}>
            <i className='bi bi-file-slides-fill' />
        </div>
    );
}
