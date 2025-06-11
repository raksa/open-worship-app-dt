import ScreenOtherComp from '../ScreenOtherComp';
import ScreenBackgroundComp from '../ScreenBackgroundComp';
import ScreenSlideComp from '../ScreenVaryAppDocumentComp';
import ScreenBibleComp from '../ScreenBibleComp';
import { RendStyle } from '../RenderTransitionEffectComp';
import { getScreenManagerBase } from '../managers/screenManagerBaseHelpers';
import { screenManagerFromBase } from '../managers/screenManagerHelpers';
import { ScreenManagerBaseContext } from '../managers/screenManagerHooks';

const IMAGE_BACKGROUND = `linear-gradient(45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(-45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%),
linear-gradient(-45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%)`;

export default function MiniScreenAppComp({
    screenId,
}: Readonly<{
    screenId: number;
}>) {
    const screenManager = screenManagerFromBase(getScreenManagerBase(screenId));
    if (screenManager === null) {
        return null;
    }
    const {
        varyAppDocumentEffectManager: slideEffectManager,
        backgroundEffectManager,
    } = screenManager;
    return (
        <ScreenManagerBaseContext value={screenManager}>
            <RendStyle screenEffectManager={slideEffectManager} />
            <RendStyle screenEffectManager={backgroundEffectManager} />
            <div
                style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: IMAGE_BACKGROUND,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
            />
            <ScreenBackgroundComp />
            <ScreenSlideComp />
            <ScreenBibleComp />
            <ScreenOtherComp />
        </ScreenManagerBaseContext>
    );
}
