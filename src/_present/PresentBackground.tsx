import { useEffect, useState } from 'react';
import './PresentBackground.scss';
import PresentBGManager, { BackgroundSrcType } from './PresentBGManager';

export default function PresentBackground({ bgManager }: {
    bgManager: PresentBGManager;
}) {
    const [bgSrc, setBgSrc] = useState<BackgroundSrcType | null>(null);
    useEffect(() => {
        bgManager.fireUpdate = () => {
            setBgSrc(bgManager.bgSrc);
        };
        return () => {
            bgManager.fireUpdate = () => void 0;
        };
    });
    if (bgSrc === null) {
        return null;
    }
    return (
        <div id="background">
            {bgSrc.type === 'video' && <video
                src={bgSrc.src}
                style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                }}
                autoPlay loop muted playsInline />}
        </div>
    );
}
