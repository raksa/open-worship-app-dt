import ScreenAlertComp from '../ScreenAlertComp';
import ScreenBackgroundComp from '../ScreenBackgroundComp';
import ScreenSlideComp from '../ScreenSlideComp';
import ScreenFullTextComp from '../ScreenFullTextComp';
import { RendStyle } from '../RenderTransitionEffectComp';
import {
    getScreenManagerInstance, ScreenManagerContext,
} from '../managers/screenManagerHelpers';

const IMAGE_BACKGROUND = (
    `linear-gradient(45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(-45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%),
linear-gradient(-45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%)`
);

export default function MiniScreenAppComp({ screenId }: Readonly<{
    screenId: number,
}>) {
    const screenManager = getScreenManagerInstance(screenId);
    if (screenManager === null) {
        return null;
    }
    return (
        <ScreenManagerContext value={screenManager}>
            <RendStyle screenEffectManager={screenManager.slideEffectManager} />
            <RendStyle
                screenEffectManager={screenManager.backgroundEffectManager}
            />
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
        </ScreenManagerContext>
    );
}
