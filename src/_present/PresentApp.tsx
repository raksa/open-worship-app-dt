import CloseButton from './PresentCloseButton';
import PresentBackground from './PresentBackground';
import PresentSlide from './PresentSlide';
import PresentAlert from './PresentAlert';
import PresentFullText from './PresentFullText';
import PresentManager from './PresentManager';
import { RendStyle } from './transition-effect/RenderTransitionEffect';
import appProviderPresent from './appProviderPresent';
import {
    initReceivePresentMessage,
    sendPresentMessage,
} from './presentEventHelpers';

initReceivePresentMessage();
export default function PresentApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const presentId = +(urlParams.get('presentId') || '') || 0;
    const presentManager = PresentManager.getInstance(presentId);
    if (appProviderPresent.isPresent) {
        console.log('presentId', presentId);
        sendPresentMessage({
            presentId,
            type: 'init',
            data: null,
        }, true);
    }
    return (
        <>
            <RendStyle ptEffectTarget='background'
                presentId={presentManager.presentId} />
            <RendStyle ptEffectTarget='slide'
                presentId={presentManager.presentId} />
            <PresentBackground
                presentManager={presentManager} />
            <PresentSlide
                presentManager={presentManager} />
            <PresentFullText
                presentManager={presentManager} />
            <PresentAlert />
            <CloseButton
                presentManager={presentManager} />
        </>
    );
}
