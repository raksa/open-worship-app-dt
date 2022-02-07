import {
    keyboardEventListener,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    presentEventListener,
    usePresentBGRendering,
    usePresentFGRendering,
} from '../event/PresentEventListener';
import { getPresentRendered } from '../helper/appHelper';
import { useStateSettingBoolean } from '../helper/settingHelper';

// TODO: clear bible
export default function BGFGControl() {
    const [isPresentingBG, setIsShowingBG] = useStateSettingBoolean('bgfg-control-bg');
    const [isPresentingFG, setIsShowingFG] = useStateSettingBoolean('bgfg-control-fg');

    const clearBG = () => {
        setIsShowingBG(false);
        presentEventListener.clearBG();
    };
    const clearFG = () => {
        setIsShowingFG(false);
        presentEventListener.clearFG();
    };
    const clearAll = () => {
        clearBG();
        clearFG();
    };
    getPresentRendered().then((rendered) => {
        setIsShowingBG(!!rendered.background);
        setIsShowingFG(!!rendered.foreground);
    });
    useKeyboardRegistering({ key: 'F6' }, clearAll);
    useKeyboardRegistering({ key: 'F7' }, clearBG);
    useKeyboardRegistering({ key: 'F8' }, clearFG);
    usePresentBGRendering(() => setIsShowingBG(true));
    usePresentFGRendering(() => setIsShowingFG(true));
    const isPresenting = isPresentingBG || isPresentingFG;
    return (
        <div className="btn-group control">
            <button type="button" className={`tool-tip tool-tip-fade btn btn-sm btn-${isPresenting ? '' : 'outline-'}warning`}
                disabled={!isPresenting}
                data-tool-tip={keyboardEventListener.toShortcutKey({ key: 'F6' })}
                title="clear all" onClick={clearAll}>Clear All</button>
            <button type="button" className={`tool-tip tool-tip-fade btn btn-sm btn-${isPresentingBG ? '' : 'outline-'}secondary`}
                disabled={!isPresentingBG} title="clear background"
                data-tool-tip={keyboardEventListener.toShortcutKey({ key: 'F7' })}
                onClick={clearBG}>Clear BG</button>
            <button type="button" className={`tool-tip tool-tip-fade btn btn-sm btn-${isPresentingFG ? '' : 'outline-'}info`}
                disabled={!isPresentingFG} title="clear foreground"
                data-tool-tip={keyboardEventListener.toShortcutKey({ key: 'F8' })}
                onClick={clearFG}>Clear FG</button>
        </div>
    );
}
