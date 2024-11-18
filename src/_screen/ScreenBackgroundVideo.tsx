import { BackgroundSrcType } from './ScreenBGManager';
import { usePBGMEvents } from './screenEventHelpers';
import { calMediaSizes } from './screenHelpers';
import { useScreenManager } from './ScreenManager';

export default function ScreenBackgroundVideo({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    const screenManager = useScreenManager();
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
