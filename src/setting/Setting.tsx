import './Setting.scss';

import { lazy } from 'react';

import { useStateSettingString } from '../helper/settingHelpers';
import TabRender, { genTabBody } from '../others/TabRender';
import { QuickOrBackButton } from '../others/commonButtons';

const LazySettingGeneral = lazy(() => {
    return import('./SettingGeneral');
});
const LazySettingBible = lazy(() => {
    return import('./bible-setting/SettingBible');
});
const LazySettingAbout = lazy(() => {
    return import('./SettingAbout');
});

const tabTypeList = [
    ['g', 'General', LazySettingGeneral],
    ['b', 'Bible', LazySettingBible],
    ['a', 'About', LazySettingAbout],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function Setting() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'popup-setting-tab', 'b',
    );
    return (
        <div id='app-setting-popup'
            className='shadow card w-100 h-100 overflow-hidden'>
            <div className='card-body d-flex flex-column'>
                <div className='setting-header d-flex'>
                    <TabRender<TabType>
                        tabs={tabTypeList.map(([type, name]) => {
                            return [type, name];
                        })}
                        activeTab={tabType}
                        setActiveTab={setTabType} />
                </div>
                <div className='setting-body flex-fill'>
                    {tabTypeList.map(([type, _, target]) => {
                        return genTabBody<TabType>(tabType, [type, target]);
                    })}
                </div>
            </div>
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
            }}>
                <QuickOrBackButton title='Quit Setting' />
            </div>
        </div>
    );
}
