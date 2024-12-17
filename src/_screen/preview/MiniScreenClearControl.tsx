import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useScreenBackgroundManagerEvents, useScreenFTManagerEvents,
    useScreenSlideManagerEvents,
} from '../screenEventHelpers';
import { useScreenManagerContext } from '../ScreenManager';

export default function MiniScreenClearControl() {
    useScreenBackgroundManagerEvents(['update']);
    useScreenSlideManagerEvents(['update']);
    useScreenFTManagerEvents(['update']);
    const screenManager = useScreenManagerContext();
    const {
        screenBackgroundManager, screenSlideManager, screenFTManager,
    } = screenManager;

    const clearBackground = () => {
        screenBackgroundManager.backgroundSrc = null;
    };
    const clearForeGround = () => {
        screenSlideManager.slideItemData = null;
    };
    const clearFullText = () => {
        screenFTManager.fullTextItemData = null;
    };
    const clearAll = () => {
        clearBackground();
        clearForeGround();
        clearFullText();
    };

    const isShowingBackground = !!screenBackgroundManager.backgroundSrc;
    const isShowingFG = !!screenSlideManager.slideItemData;
    const isShowingFT = !!screenFTManager.fullTextItemData;
    const isShowing = isShowingBackground || isShowingFG || isShowingFT;
    const btnMaps = [
        {
            'text': 'All',
            'title': 'clear all',
            'btnType': 'danger',
            'isEnabled': isShowing,
            'eventMap': { key: 'F6' },
            'onClick': clearAll,
        },
        {
            'text': 'BG',
            'title': 'clear background',
            'btnType': 'secondary',
            'isEnabled': isShowingBackground,
            'eventMap': { key: 'F7' },
            'onClick': clearBackground,
        },
        {
            'text': 'FG',
            'title': 'clear foreground',
            'btnType': 'info',
            'isEnabled': isShowingFG,
            'eventMap': { key: 'F8' },
            'onClick': clearForeGround,
        },
        {
            'text': 'FT',
            'title': 'clear full text',
            'btnType': 'primary',
            'isEnabled': isShowingFT,
            'eventMap': { key: 'F9' },
            'onClick': clearFullText,
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
