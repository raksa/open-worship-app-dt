import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    usePBGMEvents, usePFTMEvents, usePSlideMEvents,
} from '../screenEventHelpers';
import { useScreenManager } from '../ScreenManager';

export default function MiniScreenClearControl() {
    usePBGMEvents(['update']);
    usePSlideMEvents(['update']);
    usePFTMEvents(['update']);
    const screenManager = useScreenManager();
    const {
        screenBGManager, screenSlideManager, screenFTManager,
    } = screenManager;

    const clearBG = () => {
        screenBGManager.bgSrc = null;
    };
    const clearFG = () => {
        screenSlideManager.slideItemData = null;
    };
    const clearFT = () => {
        screenFTManager.ftItemData = null;
    };
    const clearAll = () => {
        clearBG();
        clearFG();
        clearFT();
    };

    const isShowingBG = !!screenBGManager.bgSrc;
    const isShowingFG = !!screenSlideManager.slideItemData;
    const isShowingFT = !!screenFTManager.ftItemData;
    const isShowing = isShowingBG || isShowingFG || isShowingFT;
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
            'isEnabled': isShowingBG,
            'eventMap': { key: 'F7' },
            'onClick': clearBG,
        },
        {
            'text': 'FG',
            'title': 'clear foreground',
            'btnType': 'info',
            'isEnabled': isShowingFG,
            'eventMap': { key: 'F8' },
            'onClick': clearFG,
        },
        {
            'text': 'FT',
            'title': 'clear full text',
            'btnType': 'primary',
            'isEnabled': isShowingFT,
            'eventMap': { key: 'F9' },
            'onClick': clearFT,
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
            title={title}
            data-tool-tip={toShortcutKey(eventMap)}
            onClick={onClickCallback}>
            {text}
        </button>
    );
}
