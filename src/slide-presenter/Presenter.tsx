import './Presenter.scss';

import { lazy } from 'react';

import {
    useLyricSelecting, useSlideSelecting,
} from '../event/PreviewingEventListener';
import {
    useSlideItemSelecting,
} from '../event/SlideListEventListener';
import {
    getSetting, useStateSettingString,
} from '../helper/settingHelpers';
import TabRender, { genTabBody } from '../others/TabRender';

const LazySlidePreviewer = lazy(() => {
    return import('./items/SlidePreviewer');
});
const LazyBiblePreviewerRender = lazy(() => {
    return import('../bible-reader/BiblePreviewerRender');
});
const LazyLyricPreviewer = lazy(() => {
    return import('../full-text-presenter/LyricPreviewer');
});
const LazyPresenterAlertController = lazy(() => {
    return import('../presenter-alert/PresenterAlertController');
});

const PRESENT_TAB_SETTING_NAME = 'presenter-tab';
export function getIsShowingSlidePreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 's';
}
export function getIsShowingFTPreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 'f';
}

const tabTypeList = [
    ['s', 'Slides', LazySlidePreviewer],
    ['b', 'Bibles', LazyBiblePreviewerRender],
    ['l', 'Lyrics', LazyLyricPreviewer],
    ['a', 'Alert', LazyPresenterAlertController],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function Presenter() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        PRESENT_TAB_SETTING_NAME, 's');
    useLyricSelecting(() => setTabType('l'));
    useSlideSelecting(() => setTabType('s'));
    useSlideItemSelecting(() => setTabType('s'));
    return (
        <div id='presenter-manager' className='w-100 h-100'>
            <TabRender<TabType>
                tabs={tabTypeList.map(([type, name]) => {
                    return [type, name];
                })}
                activeTab={tabType}
                setActiveTab={setTabType}
                className='header' />
            <div className='body w-100 overflow-hidden'>
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
