import './SettingComp.scss';

import { lazy } from 'react';

import { useStateSettingString } from '../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../others/TabRenderComp';
import { QuickOrBackButtonComp } from '../others/commonButtons';

const LazySettingGeneral = lazy(() => {
    return import('./SettingGeneralComp');
});
const LazySettingBible = lazy(() => {
    return import('./bible-setting/SettingBibleComp');
});
const LazySettingAbout = lazy(() => {
    return import('./SettingAboutComp');
});

const tabTypeList = [
    ['g', 'General', LazySettingGeneral],
    ['b', 'Bible', LazySettingBible],
    ['a', 'About', LazySettingAbout],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function SettingComp() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'popup-setting-tab', 'b',
    );
    return (
        <div id='app-setting'
            className='shadow card w-100 h-100 overflow-hidden'>
            <div className='card-body d-flex flex-column'>
                <div className='setting-header d-flex'>
                    <TabRenderComp<TabType>
                        tabs={tabTypeList.map(([type, name]) => {
                            return [type, name];
                        })}
                        activeTab={tabType}
                        setActiveTab={setTabType} />
                </div>
                <div className='setting-body flex-fill'>
                    <div style={{
                        margin: 'auto',
                        maxWidth: '600px',
                    }}>
                        {tabTypeList.map(([type, _, target]) => {
                            return genTabBody<TabType>(tabType, [type, target]);
                        })}
                    </div>
                </div>
            </div>
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
            }}>
                <QuickOrBackButtonComp title='Quit Setting' />
            </div>
        </div>
    );
}
