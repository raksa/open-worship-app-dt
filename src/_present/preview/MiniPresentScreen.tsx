import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import ShowHidePresent from './ShowHidePresent';
import ClearControl from './ClearControl';
import PresentManager from '../PresentManager';
import DisplayControl from './DisplayControl';

export default function MiniPresentScreen() {
    const presentId = 0;
    const presentManager = PresentManager.getInstance(presentId);
    presentManager.isSelected = true;
    return (
        <div className='highlight-selected'>
            <div className='mini-present-screen card w-100 h-100'>
                <div className='card-header' style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                }}>
                    <div className='d-flex justify-content-around'
                        style={{
                            minWidth: '280px',
                            maxWidth: '380px',
                        }}>
                        <ShowHidePresent
                            presentManager={presentManager} />
                        <ClearControl />
                        <DisplayControl
                            presentManager={presentManager} />
                    </div>
                </div>
                <mini-present-previewer
                    presentId={presentId} />
            </div>
        </div>
    );
}
