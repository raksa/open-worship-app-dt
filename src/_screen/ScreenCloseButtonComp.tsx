import './ScreenCloseButtonComp.scss';

import { useScreenManagerBaseContext } from './managers/screenManagerHooks';


export default function ScreenCloseButtonComp() {
    const screenManagerBase = useScreenManagerBaseContext();
    return (
        <button id="close" onClick={() => {
            screenManagerBase.hide();
        }}>x</button>
    );
}
