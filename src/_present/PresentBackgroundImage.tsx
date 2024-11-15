import { BackgroundSrcType } from './PresentBGManager';
import { usePBGMEvents } from './presentEventHelpers';
import { calMediaSizes } from './presentHelpers';
import { usePresentManager } from './PresentManager';

export default function PresentBackgroundImage({ bgSrc }: Readonly<{
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
