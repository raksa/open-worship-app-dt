import './ScreenCloseButtonComp.scss';

import {
    useScreenManagerBaseContext,
} from './managers/screenManagerBaseHelpers';


export default function ScreenCloseButtonComp() {
    const screenManagerBase = useScreenManagerBaseContext();
    return (
        <button id="close" onClick={() => {
            screenManagerBase.hide();
        }}>x</button>
    );
}
