import { usePBGMEvents } from './screenEventHelpers';
import { BackgroundSrcType, calMediaSizes } from './screenHelpers';
import { useScreenManagerContext } from './ScreenManager';

export default function ScreenBackgroundVideo({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    const screenManager = useScreenManagerContext();
    const { screenBGManager } = screenManager;
    usePBGMEvents(['update'], screenBGManager);
    const {
        width, height, offsetH, offsetV,
    } = calMediaSizes({
        parentWidth: screenManager.width,
        parentHeight: screenManager.height,
    }, bgSrc);
    return (
        <video src={bgSrc.src}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-${offsetH}px, -${offsetV}px)`,
            }}
            autoPlay loop muted playsInline
        />
    );
}
