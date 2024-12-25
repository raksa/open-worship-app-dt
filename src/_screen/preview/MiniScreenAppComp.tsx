import ScreenAlert from '../ScreenAlert';
import ScreenBackground from '../ScreenBackground';
import ScreenSlide from '../ScreenSlide';
import ScreenFullText from '../ScreenFullText';
import ScreenManager, { ScreenManagerContext } from '../ScreenManager';
import { RendStyle } from '../transition-effect/RenderTransitionEffect';

const IMAGE_BACKGROUND = (
    `linear-gradient(45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(-45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%),
linear-gradient(-45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%)`
);

export default function MiniScreenAppComp({ screenId }: Readonly<{
    screenId: number,
}>) {
    const screenManager = ScreenManager.getInstance(screenId);
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
            <ScreenBackground />
            <ScreenSlide />
            <ScreenFullText />
            <ScreenAlert />
        </ScreenManagerContext>
    );
}
