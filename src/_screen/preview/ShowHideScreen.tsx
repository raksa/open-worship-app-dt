import {
    toShortcutKey,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useScreenManagerBaseContext,
    useScreenManagerEvents,
} from '../managers/screenManagerHooks';
import ShowingScreenIcon from './ShowingScreenIcon';

const showingScreenEventMap = { key: 'F5' };
export default function ShowHideScreen() {
    const screenManagerBase = useScreenManagerBaseContext();
    useKeyboardRegistering(
        [showingScreenEventMap],
        () => {
            screenManagerBase.isShowing = !screenManagerBase.isShowing;
        },
        [screenManagerBase],
    );
    const isShowing = screenManagerBase.isShowing;
    useScreenManagerEvents(['visible'], screenManagerBase);
    return (
        <div
            className={`d-flex show-hide pointer ${isShowing ? 'showing' : ''}`}
            title={
                'Toggle showing screen ' +
                `[${toShortcutKey(showingScreenEventMap)}]`
            }
            onClick={() => {
                screenManagerBase.isShowing = !isShowing;
            }}
        >
            <ShowingScreenIcon screenId={screenManagerBase.screenId} />
            <i className="app-showing-indicator bi bi-file-slides-fill" />
        </div>
    );
}
