import { useEffect, useState } from 'react';
import { AppColorType } from '../others/ColorPicker';
import PresentBackgroundColor from './PresentBackgroundColor';
import PresentBackgroundImage from './PresentBackgroundImage';
import PresentBackgroundVideo from './PresentBackgroundVideo';
import PresentBGManager, {
    BackgroundSrcType,
} from './PresentBGManager';

export default function PresentBackground({ bgManager }: {
    bgManager: PresentBGManager;
}) {
    const [bgSrc, setBgSrc] = useState<BackgroundSrcType | null>(bgManager.bgSrc);
    useEffect(() => {
        bgManager.fireUpdate = () => {
            setBgSrc(bgManager.bgSrc);
        };
        return () => {
            bgManager.fireUpdate = () => void 0;
        };
    });
    console.log('PresentBackground');
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
