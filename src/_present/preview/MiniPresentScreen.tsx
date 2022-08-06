import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import ShowHidePresent from './ShowHidePresent';
import ClearControl from './ClearControl';
import PresentManager from '../PresentManager';

export default function MiniPresentScreen() {
    const presentId = 0;
    const presentManager = PresentManager.getInstance(presentId);
    presentManager.isSelected = true;
    return (
        <div className='highlight-selected'>
            <div className='mini-present-screen card w-100 h-100'>
                <div className='card-header d-flex justify-content-around'>
                    <ShowHidePresent
                        presentManager={presentManager} />
                    <ClearControl />
                </div>
                <mini-present-previewer
                    presentId={presentId} />
            </div>
        </div>
    );
}
