import './FullTextPreviewer.scss';

import React from 'react';
import {
    useLyricSelecting,
} from '../event/PreviewingEventListener';
import {
    getSetting, setSetting,
    useStateSettingString,
} from '../helper/settingHelper';
import TabRender, {
    genTabBody,
} from '../others/TabRender';
import {
    getIsShowingFTPreviewer,
} from '../slide-presenting/Presenting';

const BiblePreviewer = React.lazy(() => {
    return import('../read-bible/BiblePreviewer');
});
const LyricPreviewer = React.lazy(() => {
    return import('./LyricPreviewer');
});

const FT_TAB_SETTING_NAME = 'full-text-previewer';
export function getIsPreviewingBible() {
    return getIsShowingFTPreviewer() &&
        getSetting(FT_TAB_SETTING_NAME) === 'b';
}
export function setIsPreviewingBible() {
    setSetting(FT_TAB_SETTING_NAME, 'b');
}
export function getIsPreviewingLyric() {
    return getIsShowingFTPreviewer() &&
        getSetting(FT_TAB_SETTING_NAME) === 'l';
}
export function setIsPreviewingLyric() {
    setSetting(FT_TAB_SETTING_NAME, 'l');
}
const tabTypeList = [
    ['b', 'Bible', BiblePreviewer],
    ['l', 'Lyric', LyricPreviewer],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function FullTextPreviewer() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        FT_TAB_SETTING_NAME, 'b');
    useLyricSelecting((item) => {
        if (item !== null) {
            setTabType('l');
        }
    });
    return (
        <div className={'ft-previewer overflow-hidden border-white-round '
            + 'h-100 d-flex flex-column p-1'}
            style={{
                minWidth: '300px',
            }}>
            <div className='header d-flex'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='body p-2 flex-fill overflow-hidden'>
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
