import './Presenting.scss';

import SlidePreviewer from './SlidePreviewer';
import FullTextPresentController from '../full-text-present/FullTextPresentController';
import { useFullTextPresenting, useSlidePresenting } from '../event/PreviewingEventListener';
import { useSlideItemThumbSelecting } from '../event/SlideListEventListener';
import { useStateSettingString } from '../helper/settingHelper';
import { useTranslation } from 'react-i18next';
import { FULL_TEXT_TAB_KEY } from '../full-text-present/FullTextPreviewer';

export default function Presenting() {
    const { t } = useTranslation();
    // s: slides, f: full text
    const [tabType, setTabType] = useStateSettingString('presenting-tab', 's');
    const [_, setFTTabType] = useStateSettingString(FULL_TEXT_TAB_KEY, 'b');
    useFullTextPresenting(() => {
        setTabType('f');
        setFTTabType('l');
    });
    useSlidePresenting(() => setTabType('s'));
    useSlideItemThumbSelecting(() => setTabType('s'));
    return (
        <div id="presenting" className="w-100 h-100">
            <ul className="header nav nav-tabs">
                {[['s', 'Slide'], ['f', 'Full Text']].map(([key, title], i) => {
                    return (<li key={i} className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                            onClick={() => {
                                if (key !== tabType) {
                                    setTabType(key);
                                }
                            }}>
                            {t(title)}
                        </button>
                    </li>);
                })}
            </ul>
            <div className="body w-100 p-10">
                {tabType === 's' && <SlidePreviewer />}
                {tabType === 'f' && <FullTextPresentController />}
            </div>
        </div>
    );
}
