import CloseButton from './PresentCloseButton';
import PresentBackground from './PresentBackground';
import PresentSlide from './PresentSlide';
import PresentAlert from './PresentAlert';
import PresentFullText from './PresentFullText';
import PresentManager, { PresentManagerContext } from './PresentManager';
import { RendStyle } from './transition-effect/RenderTransitionEffect';
import appProviderPresent from './appProviderPresent';
import {
    initReceivePresentMessage, sendPresentMessage,
} from './presentEventHelpers';
import { useCheckSelectedDir } from '../helper/tourHelpers';

initReceivePresentMessage();
export default function PresentApp() {
    useCheckSelectedDir();
    const urlParams = new URLSearchParams(window.location.search);
    const presentId = +(urlParams.get('presentId') ?? '0');
    const presentManager = PresentManager.createInstance(presentId);
    if (presentManager === null) {
        return null;
    }
    if (appProviderPresent.isPresent) {
        sendPresentMessage({
            presentId,
            type: 'init',
            data: null,
        }, true);
    }
    return (
        <PresentManagerContext.Provider value={presentManager}>
            <RendStyle ptEffectTarget='background' />
            <RendStyle ptEffectTarget='slide' />
            <PresentBackground />
            <PresentSlide />
            <PresentFullText />
            <PresentAlert />
            <CloseButton />
        </PresentManagerContext.Provider>
    );
}
