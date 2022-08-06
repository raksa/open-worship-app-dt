import PresentAlert from '../PresentAlert';
import PresentBackground from '../PresentBackground';
import PresentForeground from '../PresentForeground';
import PresentFullText from '../PresentFullText';
import PresentManager from '../PresentManager';

export default function MiniPresentApp({ id }: { id: number }) {
    const presentManager = PresentManager.getInstance(id);
    const { presentBGManager } = presentManager;
    return (
        <>
            <PresentBlankBG />
            <PresentBackground
                bgManager={presentBGManager} />
            <PresentForeground />
            <PresentFullText />
            <PresentAlert />
        </>
    );
}

function PresentBlankBG() {
    return (
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
    );
}
