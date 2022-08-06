import KeyboardEventListener, {
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    presentEventListener,
    usePresentBGRendering,
    usePresentFGRendering,
    usePresentFTRendering,
} from '../../event/PresentEventListener';

export default function ClearControl() {
    const isPresentingBG = usePresentBGRendering();
    const isPresentingFG = usePresentFGRendering();
    const isPresentingFT = usePresentFTRendering();
    const clearBG = () => presentEventListener.clearBG();
    const clearFG = () => presentEventListener.clearFG();
    const clearFT = () => presentEventListener.clearFT();
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
            <button type='button' className={`tool-tip tool-tip-fade btn btn-sm btn-${isPresenting ? '' : 'outline-'}danger`}
                disabled={!isPresenting}
                data-tool-tip={KeyboardEventListener.toShortcutKey({ key: 'F6' })}
                title='clear all' onClick={clearAll}>All</button>
            <button type='button' className={`tool-tip tool-tip-fade btn btn-sm btn-${isPresentingBG ? '' : 'outline-'}secondary`}
                disabled={!isPresentingBG} title='clear background'
                data-tool-tip={KeyboardEventListener.toShortcutKey({ key: 'F7' })}
                onClick={clearBG}>BG</button>
            <button type='button' className={`tool-tip tool-tip-fade btn btn-sm btn-${isPresentingFG ? '' : 'outline-'}info`}
                disabled={!isPresentingFG} title='clear foreground'
                data-tool-tip={KeyboardEventListener.toShortcutKey({ key: 'F8' })}
                onClick={clearFG}>FG</button>
            <button type='button' className={`tool-tip tool-tip-fade btn btn-sm btn-${isPresentingFT ? '' : 'outline-'}primary`}
                disabled={!isPresentingFT} title='clear full text'
                data-tool-tip={KeyboardEventListener.toShortcutKey({ key: 'F9' })}
                onClick={clearFT}>FT</button>
        </div>
    );
}
