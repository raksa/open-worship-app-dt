import { AppColorType } from '../others/ColorPicker';
import PresentBackgroundColor from './PresentBackgroundColor';
import PresentBackgroundImage from './PresentBackgroundImage';
import PresentBackgroundVideo from './PresentBackgroundVideo';
import PresentBGManager from './PresentBGManager';
import { usePBGMEvents } from './presentHelpers';

export default function PresentBackground({ bgManager }: {
    bgManager: PresentBGManager;
}) {
    usePBGMEvents(['update']);
    const bgSrc = bgManager.bgSrc;
    if (bgSrc === null) {
        return null;
    }
    return (
        <div style={{
            pointerEvents: 'none',
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        }}>
            {bgSrc.type === 'image' && <PresentBackgroundImage
                src={bgSrc.src} />}
            {bgSrc.type === 'video' && <PresentBackgroundVideo
                src={bgSrc.src} />}
            {bgSrc.type === 'color' && <PresentBackgroundColor
                color={bgSrc.src as AppColorType} />}
        </div>
    );
}
