import './ScreenCloseButton.scss';

import { useScreenManager } from './ScreenManager';

export default function ScreenCloseButton() {
    const screenManager = useScreenManager();
    return (
        <button id="close" onClick={() => {
            screenManager.hide();
        }}>x</button>
    );
}
