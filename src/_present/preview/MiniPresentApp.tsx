import PresentAlert from '../PresentAlert';
import PresentBackground from '../PresentBackground';
import PresentSlide from '../PresentSlide';
import PresentFullText from '../PresentFullText';
import PresentManager from '../PresentManager';
import { RendStyle } from '../transition-effect/RenderTransitionEffect';

export default function MiniPresentApp({ id }: { id: number }) {
    const presentManager = PresentManager.getInstance(id);
    return (
        <>
            <RendStyle
                ptEffectTarget='background' />
            <RendStyle
                ptEffectTarget='slide' />
            <div style={{
                pointerEvents: 'none',
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: `linear-gradient(45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
                linear-gradient(-45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
                linear-gradient(45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%),
                linear-gradient(-45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }} />
            <PresentBackground
                presentManager={presentManager} />
            <PresentSlide
                presentManager={presentManager} />
            <PresentFullText />
            <PresentAlert />
        </>
    );
}
