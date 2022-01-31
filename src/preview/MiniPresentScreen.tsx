import './MiniPresentScreen.scss';

import ShowHidePresent from './ShowHidePresent';
import PreviewThumbnail from './MiniPreviewThumbnail';
import BGFGControl from './BGFGControl';

export default function MiniPresentScreen() {
    return (
        <div id="mini-present-screen" className="card w-100 h-100">
            <div className="card-header d-flex justify-content-around">
                <ShowHidePresent />
                <BGFGControl />
            </div>
            <div className="card-body">
                <PreviewThumbnail />
            </div>
        </div>
    );
}
