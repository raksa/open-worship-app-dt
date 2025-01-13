import {
    toShortcutKey,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import ScreenManager from '../managers/ScreenManager';
import {
    useScreenManagerEvents,
    useScreenManagerContext,
} from '../managers/screenManagerHooks';

function RenderButtonComp({
    btnMaps,
}: Readonly<{
    btnMaps: {
        title: string;
        text: string | React.ReactNode;
        btnType: string;
        onClick: () => void;
        eventMap: { key: string };
        isEnabled: boolean;
    };
}>) {
    const { title, text, btnType, onClick, eventMap, isEnabled } = btnMaps;
    const onClickCallback = isEnabled ? onClick : () => {};
    useKeyboardRegistering([eventMap], onClickCallback, [isEnabled]);
    return (
        <button
            type="button"
            className={`btn btn-${isEnabled ? '' : 'outline-'}${btnType}`}
            title={`${title} [${toShortcutKey(eventMap)}]`}
            onClick={onClickCallback}
        >
            {text}
        </button>
    );
}

function genBtnMaps(screenManager: ScreenManager) {
    const {
        screenBackgroundManager,
        screenSlideManager,
        screenFullTextManager,
        screenAlertManager,
    } = screenManager;

    const isShowingBackground = screenBackgroundManager.isShowing;
    const isShowingFG = screenSlideManager.isShowing;
    const isShowingFullText = screenFullTextManager.isShowing;
    const isShowingAlert = screenAlertManager.isShowing;
    const isShowing =
        isShowingBackground ||
        isShowingFG ||
        isShowingFullText ||
        isShowingAlert;
    return [
        {
            text: <i className="bi bi-eraser" />,
            title: 'Clear all',
            btnType: 'danger',
            isEnabled: isShowing,
            eventMap: { key: 'F6' },
            onClick: () => {
                screenManager.clear();
            },
        },
        {
            text: 'BG',
            title: 'Clear background',
            btnType: 'secondary',
            isEnabled: isShowingBackground,
            eventMap: { key: 'F7' },
            onClick: () => {
                screenBackgroundManager.clear();
            },
        },
        {
            text: 'FG',
            title: 'Clear foreground',
            btnType: 'info',
            isEnabled: isShowingFG,
            eventMap: { key: 'F8' },
            onClick: () => {
                screenSlideManager.clear();
            },
        },
        {
            text: 'FT',
            title: 'Clear full text',
            btnType: 'primary',
            isEnabled: isShowingFullText,
            eventMap: { key: 'F9' },
            onClick: () => {
                screenFullTextManager.clear();
            },
        },
    ];
}

export default function MiniScreenClearControlComp() {
    useScreenManagerEvents(['update']);
    const screenManager = useScreenManagerContext();
    const btnMaps = genBtnMaps(screenManager);
    return (
        <div className="btn-group control">
            {btnMaps.map((btnMaps) => {
                return (
                    <RenderButtonComp key={btnMaps.title} btnMaps={btnMaps} />
                );
            })}
        </div>
    );
}
