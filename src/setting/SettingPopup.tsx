import './SettingPopup.scss';

import { useStateSettingString } from '../helper/settingHelper';
import TabRender, { genTabBody } from '../others/TabRender';
import React from 'react';
import { useModal } from '../app-modal/Modal';

const SettingGeneral = React.lazy(() => {
    return import('./SettingGeneral');
});
const SettingBible = React.lazy(() => {
    return import('./bible-setting/SettingBible');
});
const SettingAbout = React.lazy(() => {
    return import('./SettingAbout');
});

export default function SettingPopup() {
    const { Modal } = useModal();
    return (
        <Modal>
            <div id='setting-popup'
                className='app-modal shadow card'>
                <div className='card-header text-center w-100'>
                    <span>
                        <i className='bi bi-gear-wide-connected' />
                        Setting
                    </span>
                </div>
                <Setting />
            </div>
        </Modal>
    );
}
const tabTypeList = [
    ['g', 'General', SettingGeneral],
    ['b', 'Bible', SettingBible],
    ['a', 'About', SettingAbout],
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
            <div className='setting-body flex-fill flex h'>
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
