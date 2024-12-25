import ScreenAlertComp from '../ScreenAlertComp';
import ScreenBackgroundComp from '../ScreenBackgroundComp';
import ScreenSlideComp from '../ScreenSlideComp';
import ScreenFullTextComp from '../ScreenFullTextComp';
import { RendStyle } from '../RenderTransitionEffectComp';
import {
    getScreenManagerInstance, ScreenManagerBaseContext,
} from '../managers/screenManagerBaseHelpers';

const IMAGE_BACKGROUND = (
    `linear-gradient(45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(-45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%),
linear-gradient(-45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%)`
);

export default function MiniScreenAppComp({ screenId }: Readonly<{
    screenId: number,
}>) {
    const screenManagerBase = getScreenManagerInstance(screenId);
    if (screenManagerBase === null) {
        return null;
    }
    const { slideEffectManager, backgroundEffectManager } = screenManagerBase;
    return (
        <ScreenManagerBaseContext value={screenManagerBase}>
            <RendStyle screenEffectManager={slideEffectManager} />
            <RendStyle screenEffectManager={backgroundEffectManager} />
            <div style={{
                pointerEvents: 'none',
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: IMAGE_BACKGROUND,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }} />
            <ScreenBackgroundComp />
            <ScreenSlideComp />
            <ScreenFullTextComp />
            <ScreenAlertComp />
        </ScreenManagerBaseContext>
    );
}
