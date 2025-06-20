import './SettingComp.scss';

import { lazy } from 'react';

import { setSetting, useStateSettingString } from '../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../others/TabRenderComp';
import { QuickOrBackButtonComp } from '../others/commonButtons';
import { goToPath } from '../router/routeHelpers';
import appProvider from '../server/appProvider';

const LazySettingGeneralComp = lazy(() => {
    return import('./SettingGeneralComp');
});
const LazySettingBibleComp = lazy(() => {
    return import('./bible-setting/SettingBibleComp');
});
const LazySettingAboutComp = lazy(() => {
    return import('./SettingAboutComp');
});

const SETTING_SETTING_NAME = 'setting-tabs';

export function goToGeneralSetting() {
    setSetting(SETTING_SETTING_NAME, 'g');
    goToPath(appProvider.settingHomePage);
}

const tabTypeList = [
    ['g', 'General', LazySettingGeneralComp],
    ['b', 'Bible', LazySettingBibleComp],
    ['a', 'About', LazySettingAboutComp],
] as const;
type TabKeyType = (typeof tabTypeList)[number][0];
export default function SettingComp() {
    const [tabKey, setTabKey] = useStateSettingString<TabKeyType>(
        SETTING_SETTING_NAME,
        'g',
    );
    return (
        <div id="app-setting" className="card w-100 h-100 overflow-hidden">
            <div className="card-header">
                <TabRenderComp<TabKeyType>
                    tabs={tabTypeList.map(([key, name]) => {
                        return {
                            key,
                            title: name,
                        };
                    })}
                    activeTab={tabKey}
                    setActiveTab={setTabKey}
                />
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                    }}
                >
                    <QuickOrBackButtonComp title="Quit Setting" />
                </div>
            </div>
            <div className="card-body overflow-hidden">
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabKeyType>(tabKey, [type, target]);
                })}
            </div>
        </div>
    );
}
