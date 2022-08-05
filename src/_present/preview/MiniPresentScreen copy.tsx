import './MiniPresentScreen.scss';

import ShowHidePresent from './ShowHidePresent';
import PresentScreenPreviewer from './PresentScreenPreviewer';
import ClearControl from './ClearControl';
import { presentEventListener } from '../../event/PresentEventListener';
import { useSlideItemSelecting } from '../../event/SlideListEventListener';
import { renderFG } from '../../helper/presentingHelpers';
import { genSlideItemHtmlString } from '../../slide-presenting/items/SlideItemRenderer';

export default function MiniPresentScreen() {
    useSlideItemSelecting(async(slideItem) => {
        if (slideItem !== null) {
            const htmlString = genSlideItemHtmlString(slideItem);
            renderFG(htmlString);
            presentEventListener.renderFG();
        } else {
            presentEventListener.clearFG();
        }
    });
    return (
        <div id='mini-present-screen' className='card w-100 h-100'>
            <div className='card-header d-flex justify-content-around'>
                <ShowHidePresent />
                <ClearControl />
            </div>
            <div className='card-body'>
                <PresentScreenPreviewer />
            </div>
        </div>
    );
}
