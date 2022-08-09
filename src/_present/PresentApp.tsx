import CloseButton from './PresentCloseButton';
import PresentBackground from './PresentBackground';
import PresentForeground from './PresentForeground';
import PresentAlert from './PresentAlert';
import PresentFullText from './PresentFullText';
import PresentManager from './PresentManager';
import PresentTransitionEffect from './PresentTransitionEffect';

export default function PresentApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const presentId = +(urlParams.get('presentId') || '') || 0;
    const presentManager = PresentManager.getInstance(presentId);
    return (
        <>
            <style>
                {PresentTransitionEffect.getInstance('background').style}
            </style>
            <PresentBackground
                presentManager={presentManager} />
            <PresentForeground />
            <PresentFullText />
            <PresentAlert />
            <CloseButton
                presentManager={presentManager} />
        </>
    );
}
