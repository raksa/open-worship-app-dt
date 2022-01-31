import './Presenting.scss';

import SlidePreview from './SlidePresentingController';
import FullTextPresentController from '../full-text-present/FullTextPresentController';
import { useBiblePresenting } from '../event/BibleListEventListener';
import { useSlideItemThumbSelecting, useSlideSelecting } from '../event/SlideListEventListener';
import fullTextPresentHelper from '../full-text-present/fullTextPresentHelper';
import { useStateSettingString } from '../helper/helpers';

export default function Presenting() {
    // s: slides, f: full text
    const [tabType, setTabType] = useStateSettingString('slide-presenting-tab', 's');
    useBiblePresenting(() => setTabType('f'));
    useSlideSelecting(() => setTabType('s'));
    useSlideItemThumbSelecting(() => setTabType('s'));
    return (
        <div id="presenting" className="w-100 h-100">
            <ul className="header nav nav-tabs">
                <li className="nav-item">
                    <button className={`btn btn-link nav-link ${tabType === 's' ? 'active' : ''}`}
                        onClick={() => {
                            setTabType('s');
                            fullTextPresentHelper.hide();
                        }}>
                        Slides
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
