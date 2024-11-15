import {
    toShortcutKey, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    usePBGMEvents, usePFTMEvents, usePSlideMEvents,
} from '../presentEventHelpers';
import { usePresentManager } from '../PresentManager';

export default function MiniScreenClearControl() {
    usePBGMEvents(['update']);
    usePSlideMEvents(['update']);
    usePFTMEvents(['update']);
    const presentManager = usePresentManager();
    const {
        presentBGManager,
        presentSlideManager,
        presentFTManager,
    } = presentManager;

    const clearBG = () => {
        presentBGManager.bgSrc = null;
    };
    const clearFG = () => {
        presentSlideManager.slideItemData = null;
    };
    const clearFT = () => {
        presentFTManager.ftItemData = null;
    };
    const clearAll = () => {
        clearBG();
        clearFG();
        clearFT();
    };

    const isPresentingBG = !!presentBGManager.bgSrc;
    const isPresentingFG = !!presentSlideManager.slideItemData;
    const isPresentingFT = !!presentFTManager.ftItemData;
    const isPresenting = isPresentingBG || isPresentingFG || isPresentingFT;
    const btnMaps = [
        {
            'text': 'All',
            'title': 'clear all',
            'btnType': 'danger',
            'isEnabled': isPresenting,
            'eventMap': { key: 'F6' },
            'onClick': clearAll,
        },
        {
            'text': 'BG',
            'title': 'clear background',
            'btnType': 'secondary',
            'isEnabled': isPresentingBG,
            'eventMap': { key: 'F7' },
            'onClick': clearBG,
        },
        {
            'text': 'FG',
            'title': 'clear foreground',
            'btnType': 'info',
            'isEnabled': isPresentingFG,
            'eventMap': { key: 'F8' },
            'onClick': clearFG,
        },
        {
            'text': 'FT',
            'title': 'clear full text',
            'btnType': 'primary',
            'isEnabled': isPresentingFT,
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
