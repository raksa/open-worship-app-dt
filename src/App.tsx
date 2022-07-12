import './App.scss';
import './others/bootstrap-override.scss';
import './others/scrollbar.scss';
import './others/tool-tip.scss';

import BibleSearchHeader from './bible-search/BibleSearchHeader';
import HandleBibleSearch from './bible-search/HandleBibleSearch';
import Toast from './others/Toast';
import HandleItemSlideEdit from './slide-presenting/HandleItemSlideEdit';
import { getSetting, useStateSettingString } from './helper/settingHelper';
import AppPresenting from './AppPresenting';
import AppEditing from './AppEditing';
import AppContextMenu from './others/AppContextMenu';
import SettingHeader from './setting/SettingHeader';
import HandleSetting from './setting/HandleSetting';
import TabRender from './others/TabRender';
import { useEffect } from 'react';

const WINDOW_TYPE = 'window-type';
export function getWindowMode() {
    const windowType = getSetting(WINDOW_TYPE);
    return ~['e', 'p'].indexOf(windowType) ? windowType as any : 'p';
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

// e: editing, p: presenting
type TabType = 'e' | 'p';
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
        <div id="app" className="dark d-flex flex-column">
            <div className="app-header d-flex">
                <TabRender<TabType> tabs={[
                    ['e', 'Editing'],
                    ['p', 'Presenting'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
                <div className="highlight-border-bottom d-flex justify-content-center flex-fill">
                    <BibleSearchHeader />
                </div>
                <div className='highlight-border-bottom'>
                    <SettingHeader />
                </div>
            </div>
            <div className="app-body flex-fill flex h border-white-round">
                {tabType === 'e' && <AppEditing />}
                {tabType === 'p' && <AppPresenting />}
            </div>
            <div id="pseudo-windows">
                <HandleBibleSearch />
                <HandleItemSlideEdit />
                <HandleSetting />
            </div>
            <Toast />
            <AppContextMenu />
        </div>
    );
}
