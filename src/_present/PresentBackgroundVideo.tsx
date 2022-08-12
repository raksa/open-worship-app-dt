import { BackgroundSrcType } from './PresentBGManager';
import { calMediaSizes, usePBGMEvents } from './presentHelpers';
import PresentManager from './PresentManager';

export default function PresentBackgroundVideo({
    bgSrc, presetManager,
}: {
    bgSrc: BackgroundSrcType,
    presetManager: PresentManager;
}) {
    const { presentBGManager } = presetManager;
    usePBGMEvents(['update'], presentBGManager);
    const {
        width, height,
        offsetH, offsetV,
    } = calMediaSizes(presetManager, bgSrc);
    return (
        <video src={bgSrc.src}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-${offsetH}px, -${offsetV}px)`,
            }}
            autoPlay loop muted playsInline />
    );
}
