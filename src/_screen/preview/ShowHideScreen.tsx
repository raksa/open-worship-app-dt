import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { usePMEvents } from '../screenEventHelpers';
import { useScreenManagerContext } from '../ScreenManager';
import ShowingScreenIcon from './ShowingScreenIcon';

const showingScreenEventMap = { key: 'F5' };
export default function ShowHideScreen() {
    const screenManager = useScreenManagerContext();
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
            <ShowingScreenIcon screenId={screenManager.screenId} />
            <i className='bi bi-file-slides-fill' />
        </div>
    );
}
