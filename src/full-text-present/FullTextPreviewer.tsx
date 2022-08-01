import React from 'react';
import {
    useBibleItemSelecting, useLyricSelecting,
} from '../event/PreviewingEventListener';
import {
    getSetting, setSetting, useStateSettingString,
} from '../helper/settingHelper';
import TabRender, { genTabBody } from '../others/TabRender';
import { getIsShowingFTPreviewer } from '../slide-presenting/Presenting';

const BiblePreviewer = React.lazy(() => import('./BiblePreviewer'));
const LyricPreviewer = React.lazy(() => import('./LyricPreviewer'));

export const previewer: { show: Function } = {
    show: () => false,
};
const FT_TAB_SETTING_NAME = 'full-text-previewer';
export function getIsPreviewingBible() {
    return getIsShowingFTPreviewer() &&
        getSetting(FT_TAB_SETTING_NAME) === 'b';
}
export function setIsPreviewingBible() {
    return setSetting(FT_TAB_SETTING_NAME, 'b');
}
export function getIsPreviewingLyric() {
    return getIsShowingFTPreviewer() &&
        getSetting(FT_TAB_SETTING_NAME) === 'l';
}
export function setIsPreviewingLyric() {
    return setSetting(FT_TAB_SETTING_NAME, 'l');
}
export type TabType = 'b' | 'l';
// b: bible, l: lyric
export default function FullTextPreviewer() {
    const [tabType, setTabType] = useStateSettingString<TabType>(FT_TAB_SETTING_NAME, 'b');
    useBibleItemSelecting((item) => {
        if (item !== null) {
            setTabType('b');
        }
    });
    useLyricSelecting((item) => {
        if (item !== null) {
            setTabType('l');
        }
    });
    return (
        <div className='previewer overflow-hidden border-white-round h-100 d-flex flex-column p-1'>
            <div className='previewer-header d-flex'>
                <TabRender<'b' | 'l'> tabs={[
                    ['b', 'Bible'],
                    ['l', 'Lyric'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='previewer-header p-2 flex-fill overflow-hidden'>
                {genTabBody(tabType, ['b', BiblePreviewer])}
                {genTabBody(tabType, ['l', LyricPreviewer])}
            </div>
        </div>
    );
}
