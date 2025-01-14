import CloseButton from './ScreenCloseButtonComp';
import ScreenBackgroundComp from './ScreenBackgroundComp';
import ScreenSlideComp from './ScreenVaryAppDocumentComp';
import ScreenAlertComp from './ScreenAlertComp';
import ScreenFullTextComp from './ScreenFullTextComp';
import { RendStyle } from './RenderTransitionEffectComp';
import appProviderScreen from './appProviderScreen';
import { createScreenManager } from './managers/screenManagerHelpers';
import ScreenManager from './managers/ScreenManager';
import { ScreenManagerBaseContext } from './managers/screenManagerHooks';

ScreenManager.initReceiveScreenMessage();
export default function ScreenAppComp() {
    const urlParams = new URLSearchParams(window.location.search);
    const screenId = parseInt(urlParams.get('screenId') ?? '');
    if (isNaN(screenId)) {
        return null;
    }
    const screenManager = createScreenManager(screenId);
    if (screenManager === null) {
        return null;
    }
    if (appProviderScreen.isScreen) {
        screenManager.sendScreenMessage(
            {
                screenId,
                type: 'init',
                data: null,
            },
            true,
        );
    }
    return (
        <ScreenManagerBaseContext value={screenManager}>
            <RendStyle
                screenEffectManager={screenManager.varyAppDocumentEffectManager}
            />
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
