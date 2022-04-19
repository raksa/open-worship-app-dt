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
import { t } from 'i18next';

const WINDOW_TYPE = 'window-type';
export function getWindowMode() {
    const t = getSetting(WINDOW_TYPE);
    return ~['e', 'p'].indexOf(t) ? t as any : 'p';
}
export function isWindowEditingMode() {
    const t = getWindowMode();
    return t === 'e';
}

export default function App() {
    // e: editing, p: presenting
    const [tabType, setTabType] = useStateSettingString(WINDOW_TYPE, 'p');
    return (
        <div id="app" className="dark d-flex flex-column">
            <div className="app-header d-flex">
                <ul className="nav nav-tabs ">
                    {[['e', 'Editing'], ['p', 'Presenting']].map(([key, title], i) => {
                        return (<li key={i} className="nav-item">
                            <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                                onClick={() => setTabType(key)}>
                                {t(title)}
                            </button>
                        </li>);
                    })}
                </ul>
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
