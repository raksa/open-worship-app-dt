import './ScreenCloseButtonComp.scss';

import { useScreenManagerContext } from './managers/ScreenManager';

export default function ScreenCloseButtonComp() {
    const screenManager = useScreenManagerContext();
    return (
        <button id="close" onClick={() => {
            screenManager.hide();
        }}>x</button>
    );
}
