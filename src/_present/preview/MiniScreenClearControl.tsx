import {
    toShortcutKey,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    usePBGMEvents,
    usePFTMEvents,
    usePSlideMEvents,
} from '../presentEventHelpers';
import PresentManager from '../PresentManager';

export default function MiniScreenClearControl({ presentManager }: {
    presentManager: PresentManager;
}) {
    usePBGMEvents(['update']);
    usePSlideMEvents(['update']);
    usePFTMEvents(['update']);
    const {
        presentBGManager,
        presentSlideManager,
        presentFTManager,
    } = presentManager;
    const isPresentingBG = !!presentBGManager.bgSrc;
    const isPresentingFG = !!presentSlideManager.slideItemData;
    const isPresentingFT = !!presentFTManager.ftItemData;
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
    useKeyboardRegistering({ key: 'F6' }, clearAll);
    useKeyboardRegistering({ key: 'F7' }, clearBG);
    useKeyboardRegistering({ key: 'F8' }, clearFG);
    useKeyboardRegistering({ key: 'F9' }, clearFT);
    const isPresenting = isPresentingBG || isPresentingFG || isPresentingFT;
    return (
        <div className='btn-group control'>
            <button type='button'
                className={`btn btn-sm btn-${isPresenting ?
                    '' : 'outline-'}danger`}
                disabled={!isPresenting}
                title='clear all'
                data-tool-tip={toShortcutKey({
                    key: 'F6',
                })}
                onClick={clearAll}>All</button>

            <button type='button'
                className={'btn btn-sm '
                    + `btn-${isPresentingBG ? '' : 'outline-'}secondary`}
                disabled={!isPresentingBG}
                title='clear background'
                data-tool-tip={toShortcutKey({
                    key: 'F7',
                })}
                onClick={clearBG}>BG</button>

            <button type='button' className={'btn btn-sm '
                + `btn-${isPresentingFG ? '' : 'outline-'}info`}
                disabled={!isPresentingFG}
                title='clear foreground'
                data-tool-tip={toShortcutKey({
                    key: 'F8',
                })}
                onClick={clearFG}>FG</button>

            <button type='button' className={'btn btn-sm '
                + `btn-${isPresentingFT ? '' : 'outline-'}primary`}
                disabled={!isPresentingFT}
                title='clear full text'
                data-tool-tip={toShortcutKey({
                    key: 'F9',
                })}
                onClick={clearFT}>FT</button>
        </div>
    );
}
