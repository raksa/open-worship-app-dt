import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import ShowHidePresent from './ShowHidePresent';
import ClearControl from './ClearControl';

export default function MiniPresentScreen() {
    return (
        <div className='highlight-selected'>
            <div className='mini-present-screen card w-100 h-100'>
                <div className='card-header d-flex justify-content-around'>
                    <ShowHidePresent />
                    <ClearControl />
                </div>
                <mini-present-previewer presentId={0} />
            </div>
        </div>
    );
}
