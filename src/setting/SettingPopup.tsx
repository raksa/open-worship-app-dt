import './SettingPopup.scss';

import HeaderEditorPopup from './HeaderSettingPopup';
import Modal from '../others/Modal';
import { useStateSettingString } from '../helper/settingHelper';
import TabRender, { genTabBody } from '../others/TabRender';
import React from 'react';

const SettingGeneral = React.lazy(() => import('./SettingGeneral'));
const SettingBible = React.lazy(() => import('./SettingBible'));
const SettingAbout = React.lazy(() => import('./SettingAbout'));

export default function SettingPopup() {
    return (
        <Modal>
            <div id='setting-popup'
                className='app-modal shadow card'>
                <HeaderEditorPopup />
                <Setting />
            </div>
        </Modal>
    );
}
// g: general, b: bible, a: about
type TabType = 'g' | 'b' | 'a';
function Setting() {
    const [tabType, setTabType] = useStateSettingString<TabType>('popup-setting-tab', 'b');
    return (
        <div className='card-body d-flex flex-column'>
            <div className='setting-header d-flex'>
                <TabRender<TabType> tabs={[
                    ['g', 'General'],
                    ['b', 'Bible'],
                    ['a', 'About'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='setting-body flex-fill flex h'>
                {genTabBody(tabType, ['g', SettingGeneral])}
                {genTabBody(tabType, ['b', SettingBible])}
                {genTabBody(tabType, ['a', SettingAbout])}
            </div>
        </div>
    );
}
