import './App.scss';
import './others/bootstrap-override.scss';
import './others/scrollbar.scss';

import React from 'react';
import BibleSearchHeader from './bible-search/BibleSearchHeader';
import HandleBibleSearch from './bible-search/HandleBibleSearch';
import Toast from './toast/Toast';
import HandleItemSlideEdit from './slide-presenting/HandleItemSlideEdit';
import {
    getSetting,
    useStateSettingString,
} from './helper/settingHelper';
import AppContextMenu from './others/AppContextMenu';
import SettingHeader from './setting/SettingHeader';
import HandleSetting from './setting/HandleSetting';
import TabRender, { genTabBody } from './others/TabRender';
import HandleAlert from './alert/HandleAlert';
import { useAppEffect } from './helper/debuggerHelpers';

const AppEditing = React.lazy(() => {
    return import('./AppEditing');
});
const AppPresenting = React.lazy(() => {
    return import('./AppPresenting');
});
const Read = React.lazy(() => {
    return import('./read/Read');
});

const WINDOW_EDITING_MODE = 'e';
const WINDOW_PRESENTING_MODE = 'p';
const WINDOW_READING_MODE = 'r';
const WINDOW_TYPE = 'window-type';
export function getWindowMode(): TabType {
    const windowType = getSetting(WINDOW_TYPE) as any;
    if (tabTypeList.map((item) => {
        return item[0];
    }).includes(windowType)) {
        return windowType;
    }
    return WINDOW_PRESENTING_MODE;
}
export function isWindowEditingMode() {
    const windowType = getWindowMode();
    return windowType === WINDOW_EDITING_MODE;
}
export function isWindowPresentingMode() {
    const windowType = getWindowMode();
    return windowType === WINDOW_PRESENTING_MODE;
}
export function isWindowReading() {
    const windowType = getWindowMode();
    return windowType === WINDOW_READING_MODE;
}

let startEditingSlide: (() => void) | null = null;
export function goEditSlide() {
    if (startEditingSlide !== null) {
        startEditingSlide();
    }
}

const tabTypeList = [
    [WINDOW_EDITING_MODE, 'Editing', AppEditing],
    [WINDOW_PRESENTING_MODE, 'Presenting', AppPresenting],
    [WINDOW_READING_MODE, 'Read', Read],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function App() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        WINDOW_TYPE, WINDOW_PRESENTING_MODE);
    useAppEffect(() => {
        startEditingSlide = () => {
            setTabType(WINDOW_EDITING_MODE);
        };
        return () => {
            startEditingSlide = null;
        };
    }, [], 'App');
    return (
        <div id='app' className='dark d-flex flex-column'>
            {/* <TestInfinite /> */}
            <div className='app-header d-flex'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
                <div className={'highlight-border-bottom d-flex '
                    + 'justify-content-center flex-fill'}>
                    <BibleSearchHeader />
                </div>
                <div className='highlight-border-bottom'>
                    <SettingHeader />
                </div>
            </div>
            <div className='app-body flex-fill flex h border-white-round'>
                {tabTypeList.map(([type, _, target]) => {
                    if (target === undefined) {
                        return null;
                    }
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
            <div id='pseudo-windows'>
                <HandleBibleSearch />
                <HandleItemSlideEdit />
                <HandleSetting />
            </div>
            <Toast />
            <AppContextMenu />
            <HandleAlert />
        </div>
    );
}
