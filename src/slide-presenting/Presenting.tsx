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
import RenderTransitionEffect from '../_present/transition-effect/RenderTransitionEffect';

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

const tabTypeList = [
    ['s', 'Slides', SlidePreviewer],
    ['f', 'Full Text', FullTextPresentController],
] as const;
type TabType = typeof tabTypeList[number][0];
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
            <TabRender<TabType>
                tabs={tabTypeList.map(([type, name]) => {
                    return [type, name];
                })}
                activeTab={tabType}
                setActiveTab={setTabType}
                className='header' />
            <div className='float-end pe-2'
                style={{
                    transform: 'translateY(-110%)',
                }}>
                <RenderTransitionEffect
                    target={'slide'} />
            </div>
            <div className='body w-100 p-10'>
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
