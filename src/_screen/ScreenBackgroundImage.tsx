import { usePBGMEvents } from './screenEventHelpers';
import { BackgroundSrcType, calMediaSizes } from './screenHelpers';
import { useScreenManagerContext } from './ScreenManager';

export default function ScreenBackgroundImage({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    const screenManager = useScreenManagerContext();
    const { screenBGManager } = screenManager;
    usePBGMEvents(['update'], screenBGManager);
    const {
        width, height,
        offsetH, offsetV,
    } = calMediaSizes({
        parentWidth: screenManager.width,
        parentHeight: screenManager.height,
    }, bgSrc);
    return (
        <img src={bgSrc.src}
            alt='background'
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-${offsetH}px, -${offsetV}px)`,
            }}
        />
    );
}
