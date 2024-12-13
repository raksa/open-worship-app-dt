import CloseButton from './ScreenCloseButton';
import ScreenBackground from './ScreenBackground';
import ScreenSlide from './ScreenSlide';
import ScreenAlert from './ScreenAlert';
import ScreenFullText from './ScreenFullText';
import ScreenManager, { ScreenManagerContext } from './ScreenManager';
import { RendStyle } from './transition-effect/RenderTransitionEffect';
import appProviderScreen from './appProviderScreen';
import {
    initReceiveScreenMessage, sendScreenMessage,
} from './screenEventHelpers';

initReceiveScreenMessage();
export default function ScreenApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const screenId = parseInt(urlParams.get('screenId') ?? '', 10);
    if (isNaN(screenId)) {
        return null;
    }
    const screenManager = ScreenManager.createInstance(screenId);
    if (screenManager === null) {
        return null;
    }
    if (appProviderScreen.isScreen) {
        sendScreenMessage({
            screenId,
            type: 'init',
            data: null,
        }, true);
    }
    return (
        <ScreenManagerContext value={screenManager}>
            <RendStyle ptEffectTarget='background' />
            <RendStyle ptEffectTarget='slide' />
            <ScreenBackground />
            <ScreenSlide />
            <ScreenFullText />
            <ScreenAlert />
            <CloseButton />
        </ScreenManagerContext>
    );
}
