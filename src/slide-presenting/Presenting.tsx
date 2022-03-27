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
                {/* TODO: use this pattern everywhere */}
                {[['s', 'Slide'], ['f', 'Full Text']].map(([key, title], i) => {
                    return (<li key={i} className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                            onClick={() => setTabType(key)}>
                            {title}
                        </button>
                    </li>);
                })}
            </ul>
            <div className="body w-100 p-10">
                {tabType === 's' && <SlidePreview />}
                {tabType === 'f' && <FullTextPresentController />}
            </div>
        </div>
    );
}
