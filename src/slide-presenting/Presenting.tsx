import './Presenting.scss';

import React from 'react';
import {
    useFullTextOpening,
    useSlideSelecting,
} from '../event/PreviewingEventListener';
import { useSlideItemSelecting } from '../event/SlideListEventListener';
import {
    getSetting,
    useStateSettingString,
} from '../helper/settingHelper';
import TabRender, {
    genTabBody,
} from '../others/TabRender';

const SlidePreviewer = React.lazy(() => {
    return import('./items/SlidePreviewer');
});
const FullTextPresentController = React.lazy(() => {
    return import('../full-text-present/FullTextPresentController');
});

const PRESENT_TAB_SETTING_NAME = 'presenting-tab';
export function getIsShowingSlidePreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 's';
}
export function getIsShowingFTPreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 'f';
}

// s: slides, f: full text
type TabType = 's' | 'f';
export default function Presenting() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        PRESENT_TAB_SETTING_NAME, 's');
    useFullTextOpening(() => {
        setTabType('f');
    });
    useSlideSelecting(() => setTabType('s'));
    useSlideItemSelecting(() => setTabType('s'));
    return (
        <div id='presenting' className='w-100 h-100'>
            <TabRender<TabType> tabs={[
                ['s', 'Slide'],
                ['f', 'Full Text'],
            ]}
                activeTab={tabType}
                setActiveTab={setTabType}
                className='header' />
            <div className='body w-100 p-10'>
                {genTabBody(tabType, ['s', SlidePreviewer])}
                {genTabBody(tabType, ['f', FullTextPresentController])}
            </div>
        </div>
    );
}
