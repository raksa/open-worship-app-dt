import './Presenting.scss';

import SlidePreview from './SlidePresentingController';
import FullTextPresentController from '../full-text-present/FullTextPresentController';
import { useFullTextPresenting } from '../event/FullTextPresentEventListener';
import { useSlideItemThumbSelecting, useSlideSelecting } from '../event/SlideListEventListener';
import { useStateSettingString } from '../helper/settingHelper';

export default function Presenting() {
    // s: slides, f: full text
    const [tabType, setTabType] = useStateSettingString('slide-presenting-tab', 's');
    useFullTextPresenting(() => setTabType('f'));
    useSlideSelecting(() => setTabType('s'));
    useSlideItemThumbSelecting(() => setTabType('s'));
    return (
        <div id="presenting" className="w-100 h-100">
            <ul className="header nav nav-tabs">
                <li className="nav-item">
                    <button className={`btn btn-link nav-link ${tabType === 's' ? 'active' : ''}`}
                        onClick={() => setTabType('s')}>
                        Slide
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`btn btn-link nav-link ${tabType === 'f' ? 'active' : ''}`}
                        onClick={() => setTabType('f')}>
                        Full Text
                    </button>
                </li>
            </ul>
            <div className="body w-100 p-10">
                {tabType === 's' && <SlidePreview />}
                {tabType === 'f' && <FullTextPresentController />}
            </div>
        </div>
    );
}
