import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useScreenManagerEvents,
} from '../screenEventHelpers';
import { useScreenManagerContext } from '../ScreenManager';

export default function MiniScreenClearControl() {
    useScreenManagerEvents(['update']);
    const screenManager = useScreenManagerContext();
    const {
        screenBackgroundManager, screenSlideManager, screenFullTextManager,
        screenAlertManager,
    } = screenManager;

    const isShowingBackground = screenBackgroundManager.isShowing;
    const isShowingFG = screenSlideManager.isShowing;
    const isShowingFullText = screenFullTextManager.isShowing;
    const isShowingAlert = screenAlertManager.isShowing;
    const isShowing = (
        isShowingBackground || isShowingFG || isShowingFullText ||
        isShowingAlert
    );
    const btnMaps = [
        {
            'text': 'All',
            'title': 'clear all',
            'btnType': 'danger',
            'isEnabled': isShowing,
            'eventMap': { key: 'F6' },
            'onClick': () => {
                screenManager.clear();
            },
        },
        {
            'text': 'BG',
            'title': 'clear background',
            'btnType': 'secondary',
            'isEnabled': isShowingBackground,
            'eventMap': { key: 'F7' },
            'onClick': () => {
                screenBackgroundManager.clear();
            },
        },
        {
            'text': 'FG',
            'title': 'clear foreground',
            'btnType': 'info',
            'isEnabled': isShowingFG,
            'eventMap': { key: 'F8' },
            'onClick': () => {
                screenSlideManager.clear();
            },
        },
        {
            'text': 'FT',
            'title': 'clear full text',
            'btnType': 'primary',
            'isEnabled': isShowingFullText,
            'eventMap': { key: 'F9' },
            'onClick': () => {
                screenFullTextManager.clear();
            },
        },
    ];

    return (
        <div className='btn-group control'>
            {btnMaps.map((btnMaps) => {
                return (
                    <RenderButton key={btnMaps.text} btnMaps={btnMaps} />
                );
            })}
        </div>
    );
}

function RenderButton({ btnMaps }: Readonly<{
    btnMaps: {
        title: string,
        text: string,
        btnType: string,
        onClick: () => void,
        eventMap: { key: string },
        isEnabled: boolean,
    }
}>) {
    const { title, text, btnType, onClick, eventMap, isEnabled } = btnMaps;
    const onClickCallback = isEnabled ? onClick : (() => { });
    useKeyboardRegistering([eventMap], onClickCallback);
    return (
        <button type='button'
            className={`btn btn-${isEnabled ? '' : 'outline-'}${btnType}`}
            title={`${title} [${toShortcutKey(eventMap)}]`}
            onClick={onClickCallback}>
            {text}
        </button>
    );
}
