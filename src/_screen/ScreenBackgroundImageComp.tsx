import { BackgroundSrcType, calMediaSizes } from './screenHelpers';
import {
    useScreenBackgroundManagerEvents,
} from './managers/screenEventHelpers';
import { useScreenManagerContext } from './managers/screenManagerHooks';

export default function ScreenBackgroundImageComp({ backgroundSrc }: Readonly<{
    backgroundSrc: BackgroundSrcType,
}>) {
    const screenManager = useScreenManagerContext();
    const { screenBackgroundManager } = screenManager;
    useScreenBackgroundManagerEvents(['update'], screenBackgroundManager);
    const {
        width, height,
        offsetH, offsetV,
    } = calMediaSizes({
        parentWidth: screenManager.width,
        parentHeight: screenManager.height,
    }, backgroundSrc);
    return (
        <img src={backgroundSrc.src}
            alt='background'
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-${offsetH}px, -${offsetV}px)`,
            }}
        />
    );
}
