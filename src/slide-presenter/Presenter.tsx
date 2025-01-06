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
import TabRenderComp, { genTabBody } from '../others/TabRenderComp';

const LazySlidePreviewer = lazy(() => {
    return import('./items/SlidePreviewer');
});
const LazyBiblePreviewerRender = lazy(() => {
    return import('../bible-reader/BiblePreviewerRender');
});
const LazyLyricPreviewer = lazy(() => {
    return import('../advance-presenter/LyricPreviewerComp');
});
const LazyPresenterOthersControllerComp = lazy(() => {
    return import('../presenter-others/PresenterOthersControllerComp');
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
    ['l', 'Lyrics', LazyLyricPreviewer],
    ['b', 'Bibles', LazyBiblePreviewerRender],
    ['a', 'Others', LazyPresenterOthersControllerComp],
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
            <TabRenderComp<TabType>
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
