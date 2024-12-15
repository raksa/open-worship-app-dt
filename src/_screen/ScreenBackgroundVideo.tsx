import { useScreenBackgroundManagerEvents } from './screenEventHelpers';
import { BackgroundSrcType, calMediaSizes } from './screenHelpers';
import { useScreenManagerContext } from './ScreenManager';

export default function ScreenBackgroundVideo({ backgroundSrc }: Readonly<{
    backgroundSrc: BackgroundSrcType,
}>) {
    const screenManager = useScreenManagerContext();
    const { screenBackgroundManager } = screenManager;
    useScreenBackgroundManagerEvents(['update'], screenBackgroundManager);
    const {
        width, height, offsetH, offsetV,
    } = calMediaSizes({
        parentWidth: screenManager.width,
        parentHeight: screenManager.height,
    }, backgroundSrc);
    return (
        <video src={backgroundSrc.src}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-${offsetH}px, -${offsetV}px)`,
            }}
            autoPlay loop muted playsInline
        />
    );
}
