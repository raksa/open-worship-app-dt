import './ScreenCloseButton.scss';

import { useScreenManagerContext } from './ScreenManager';

export default function ScreenCloseButton() {
    const screenManager = useScreenManagerContext();
    return (
        <button id="close" onClick={() => {
            screenManager.hide();
        }}>x</button>
    );
}
