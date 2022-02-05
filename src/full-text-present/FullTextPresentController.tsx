import './FullTextPresentController.scss';

import { BiblePresentType } from './fullTextPresentHelper';
import CustomStyle from './CustomStyle';
import FlexResizer, { getPresentingFlexSize } from '../FlexResizer';
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
    const flexSize = getPresentingFlexSize(resizeSettingName, {
        'previewer': '2',
        'tools': '1',
    });
    return (
        <div id="full-text-present-controller" className="card w-100 h-100">
            <div className="card-body flex v">
                <div data-fs='previewer' className='overflow-hidden'
                    style={{ flex: flexSize['previewer'] || 1 }}>
                    <Previewer />
                </div>
                <FlexResizer settingName={resizeSettingName} type={'v'} />
                <div className='h-100 d-flex flex-column overflow-hidden'
                    data-fs='tools' style={{ flex: flexSize['tools'] || 1 }}>
                    <Utils onShow={() => previewer.show()} />
                    <CustomStyle />
                </div>
            </div>
        </div>
    );
}
