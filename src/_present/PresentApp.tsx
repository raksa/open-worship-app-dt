import CloseButton from './PresentCloseButton';
import PresentBackground from './PresentBackground';
import PresentForeground from './PresentForeground';
import PresentAlert from './PresentAlert';
import PresentFullText from './PresentFullText';
import PresentManager from './PresentManager';

export default function PresentApp() {
    const presentManager = PresentManager.getInstance(0);
    return (
        <>
            <PresentBackground
                bgManager={presentManager.presentBGManager} />
            <PresentForeground />
            <PresentFullText />
            <PresentAlert />
            <CloseButton />
        </>
    );
}
