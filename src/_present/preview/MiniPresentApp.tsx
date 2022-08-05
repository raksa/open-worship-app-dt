import '../PresentApp.scss';

import PresentAlert from '../PresentAlert';
import PresentBackground from '../PresentBackground';
import PresentForeground from '../PresentForeground';
import PresentFullText from '../PresentFullText';
import PresentManager from '../PresentManager';


export default function MiniPresentApp({ id }: { id: number }) {
    const presentManager = PresentManager.getInstance(id);
    return (
        <>
            <PresentBackground
                bgManager={presentManager.presentBGManager} />
            <PresentForeground />
            <PresentFullText />
            <PresentAlert />
        </>
    );
}
