import CloseButton from './ScreenCloseButtonComp';
import ScreenBackgroundComp from './ScreenBackgroundComp';
import ScreenSlideComp from './ScreenSlideComp';
import ScreenAlertComp from './ScreenAlertComp';
import ScreenFullTextComp from './ScreenFullTextComp';
import { RendStyle } from './RenderTransitionEffectComp';
import appProviderScreen from './appProviderScreen';
import {
    initReceiveScreenMessage, sendScreenMessage,
} from './managers/screenEventHelpers';
import {
    createScreenManagerInstance,
    ScreenManagerBaseContext,
} from './managers/screenManagerBaseHelpers';

initReceiveScreenMessage();
export default function ScreenAppComp() {
    const urlParams = new URLSearchParams(window.location.search);
    const screenId = parseInt(urlParams.get('screenId') ?? '');
    if (isNaN(screenId)) {
        return null;
    }
    const screenManager = createScreenManagerInstance(screenId);
    if (screenManager === null) {
        return null;
    }
    if (appProviderScreen.isScreen) {
        sendScreenMessage({
            screenId, type: 'init', data: null,
        }, true);
    }
    return (
        <ScreenManagerBaseContext value={screenManager}>
            <RendStyle screenEffectManager={
                screenManager.slideEffectManager
            } />
            <RendStyle
                screenEffectManager={screenManager.backgroundEffectManager}
            />
            <ScreenBackgroundComp />
            <ScreenSlideComp />
            <ScreenFullTextComp />
            <ScreenAlertComp />
            <CloseButton />
        </ScreenManagerBaseContext>
    );
}
