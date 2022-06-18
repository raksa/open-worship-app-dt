import './FullTextPresentController.scss';

import CustomStyle from './CustomStyle';
import Utils from './Utils';
import FullTextPreviewer, { previewer } from './FullTextPreviewer';
import ReSizer from '../resizer/ReSizer';

export default function FullTextPresentController() {
    const resizeSettingName = 'full-text-present-window-size';
    const flexSizeDefault = {
        'previewer': '2',
        'tools': '1',
    };
    return (
        <div id="full-text-present-controller"
            className="card w-100 h-100 border-white-round">
            <div className="card-body flex v">
                <ReSizer settingName={resizeSettingName} flexSizeDefault={flexSizeDefault}
                    resizerKinds={['v']}
                    sizeKeys={[
                        ['previewer', 'overflow-hidden'],
                        ['tools', 'h-100 d-flex flex-column', {
                            overflowX: 'hidden',
                            overflowY: 'auto',
                        }]]}>
                    <FullTextPreviewer />
                    <>
                        <Utils onShow={() => previewer.show()} />
                        <CustomStyle />
                    </>
                </ReSizer>
            </div>
        </div>
    );
}
