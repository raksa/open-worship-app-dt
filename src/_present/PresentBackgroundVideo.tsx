import { BackgroundSrcType } from './PresentBGManager';
import { usePBGMEvents } from './presentEventHelpers';
import { calMediaSizes } from './presentHelpers';
import { usePresentManager } from './PresentManager';

export default function PresentBackgroundVideo({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    const presentManager = usePresentManager();
    const { presentBGManager } = presentManager;
    usePBGMEvents(['update'], presentBGManager);
    const {
        width, height,
        offsetH, offsetV,
    } = calMediaSizes({
        parentWidth: presentManager.width,
        parentHeight: presentManager.height,
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
