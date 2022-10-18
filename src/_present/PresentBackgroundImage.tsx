import { BackgroundSrcType } from './PresentBGManager';
import { usePBGMEvents } from './presentEventHelpers';
import { calMediaSizes } from './presentHelpers';
import PresentManager from './PresentManager';

export default function PresentBackgroundImage({
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
    } = calMediaSizes({
        parentWidth: presetManager.width,
        parentHeight: presetManager.height,
    }, bgSrc);
    return (
        <img src={bgSrc.src}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-${offsetH}px, -${offsetV}px)`,
            }} />
    );
}
