import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useScreenManagerEvents } from '../managers/screenEventHelpers';
import {
    useScreenManagerBaseContext,
} from '../managers/screenManagerBaseHelpers';
import ShowingScreenIcon from './ShowingScreenIcon';

const showingScreenEventMap = { key: 'F5' };
export default function ShowHideScreen() {
    const screenManagerBase = useScreenManagerBaseContext();
    useKeyboardRegistering([showingScreenEventMap], () => {
        screenManagerBase.isShowing = !isShowing;
    });
    useScreenManagerEvents(['visible'], screenManagerBase);
    const isShowing = screenManagerBase.isShowing;
    return (
        <div className={`d-flex show-hide pointer ${isShowing ? 'show' : ''}`}
            title={
                'Toggle showing screen ' +
                `[${toShortcutKey(showingScreenEventMap)}]`
            }
            onClick={() => {
                screenManagerBase.isShowing = !isShowing;
            }}>
            <ShowingScreenIcon screenId={screenManagerBase.screenId} />
            <i className='bi bi-file-slides-fill' />
        </div>
    );
}
