import './App.scss';
import './others/bootstrap-override.scss';
import './others/scrollbar.scss';
import './others/tool-tip.scss';

import React, { useEffect } from 'react';
import BibleSearchHeader from './bible-search/BibleSearchHeader';
import HandleBibleSearch from './bible-search/HandleBibleSearch';
import Toast from './others/Toast';
import HandleItemSlideEdit from './slide-presenting/HandleItemSlideEdit';
import { getSetting, useStateSettingString } from './helper/settingHelper';
import AppContextMenu from './others/AppContextMenu';
import SettingHeader from './setting/SettingHeader';
import HandleSetting from './setting/HandleSetting';
import TabRender, { genTabBody } from './others/TabRender';
import HandleAlert, { openConfirm } from './alert/HandleAlert';

const AppEditing = React.lazy(() => {
    return import('./AppEditing');
});
const AppPresenting = React.lazy(() => {
    return import('./AppPresenting');
});

const WINDOW_TYPE = 'window-type';
export function getWindowMode(): TabType {
    const windowType = getSetting(WINDOW_TYPE) as any;
    if (tabTypeList.map((item) => {
        return item[0];
    }).includes(windowType)) {
        return windowType;
    }
    return 'p';
}
export function isWindowEditingMode() {
    const windowType = getWindowMode();
    return windowType === 'e';
}

let startEditingSlide: (() => void) | null = null;
export function goEditSlide() {
    if (startEditingSlide !== null) {
        startEditingSlide();
    }
}

const tabTypeList = [
    ['e', 'Editing', AppEditing],
    ['p', 'Presenting', AppPresenting],
    ['r', 'Read'],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function App() {
    const [tabType, setTabType] = useStateSettingString<TabType>(WINDOW_TYPE, 'p');
    useEffect(() => {
        startEditingSlide = () => {
            setTabType('e');
        };
        return () => {
            startEditingSlide = null;
        };
    });
    return (
        <div id='app' className='dark d-flex flex-column'>
            <div className='app-header d-flex'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={(newTabType) => {
                        if (newTabType === 'r') {
                            // TODO: implement read bible
                            // should change location to read read-bible.html
                            openConfirm('Not implemented',
                                'Read mode is not implemented yet.').then((isOk) => {
                                    console.log(isOk);
                                });
                        } else {
                            setTabType(newTabType);
                        }
                    }} />
                <div className='highlight-border-bottom d-flex justify-content-center flex-fill'>
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
