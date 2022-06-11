import './FullTextPresentController.scss';

import { BiblePresentType } from './fullTextPresentHelper';
import CustomStyle from './CustomStyle';
import FlexResizer, { getPresentingFlexSize } from '../sizer/FlexResizer';
import Utils from './Utils';
import Previewer, { previewer } from './Previewer';

export function convertPresent(present: BiblePresentType,
    oldPresents: BiblePresentType[]) {
    if (oldPresents.length < 2) {
        return [present];
    }
    return oldPresents.map((oldPresent) => {
        oldPresent.target = present.target;
        return oldPresent;
    });
}

export default function FullTextPresentController() {
    const resizeSettingName = 'full-text-present-window-size';
    const flexSizeDefault = {
        'previewer': '2',
        'tools': '1',
    };
    const flexSize = getPresentingFlexSize(resizeSettingName, flexSizeDefault);
    return (
        <div id="full-text-present-controller"
            className="card w-100 h-100 border-white-round">
            <div className="card-body flex v">
                <div data-fs='previewer' data-fs-default={flexSizeDefault['previewer']}
                    className='overflow-hidden'
                    style={{ flex: flexSize['previewer'] || 1 }}>
                    <Previewer />
                </div>
                <FlexResizer settingName={resizeSettingName} type={'v'} />
                <div data-fs='tools' data-fs-default={flexSizeDefault['tools']}
                    className='h-100 d-flex flex-column'
                    style={{
                        flex: flexSize['tools'] || 1,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                    }}>
                    <Utils onShow={() => previewer.show()} />
                    <CustomStyle />
                </div>
            </div>
        </div>
    );
}
