import './ScreenCloseButtonComp.scss';

import { useScreenManagerContext } from './managers/screenManagerHelpers';


export default function ScreenCloseButtonComp() {
    const screenManager = useScreenManagerContext();
    return (
        <button id="close" onClick={() => {
            screenManager.hide();
        }}>x</button>
    );
}
