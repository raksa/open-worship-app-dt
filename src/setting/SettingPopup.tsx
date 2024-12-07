import './SettingPopup.scss';

import { lazy } from 'react';

import { useStateSettingString } from '../helper/settingHelpers';
import TabRender, { genTabBody } from '../others/TabRender';
import { useModal } from '../app-modal/Modal';
import HeaderSettingPopup from './HeaderSettingPopup';

const LazySettingGeneral = lazy(() => {
    return import('./SettingGeneral');
});
const LazySettingBible = lazy(() => {
    return import('./bible-setting/SettingBible');
});
const LazySettingAbout = lazy(() => {
    return import('./SettingAbout');
});


export default function SettingPopup() {
    const { Modal } = useModal();
    return (
        <Modal>
            <div id='setting-popup'
                className='app-modal shadow card'>
                <HeaderSettingPopup />
                <Setting />
            </div>
        </Modal>
    );
}
const tabTypeList = [
    ['g', 'General', LazySettingGeneral],
    ['b', 'Bible', LazySettingBible],
    ['a', 'About', LazySettingAbout],
] as const;
type TabType = typeof tabTypeList[number][0];
function Setting() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'popup-setting-tab', 'b');
    return (
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
    );
}
