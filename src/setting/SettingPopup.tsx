import './SettingPopup.scss';

import { useState } from 'react';
import HeaderEditorPopup from './HeaderSettingPopup';
import { StateEnum, WindowEnum, windowEventListener } from '../event/WindowEventListener';
import Modal from '../others/Modal';
import { useTranslation } from 'react-i18next';
import { SettingGeneral } from './SettingGeneral';
import { SettingBible } from './SettingBible';
import { SettingAbout } from './SettingAbout';

export const openSettingEvent = {
    window: WindowEnum.Setting,
    state: StateEnum.Open,
};
export const openSetting = () => windowEventListener.fireEvent(openSettingEvent);
export const closeSetting = () => window.location.reload();

export default function SettingPopup() {
    return (
        <Modal>
            <div id="setting-popup" className="app-modal shadow card">
                <HeaderEditorPopup />
                <Setting />
            </div>
        </Modal>
    );
}
// g: general, b: bible, a: about
type TabType = 'g' | 'b' | 'a';
function Setting() {
    const [tabType, setTabType] = useState<TabType>('b');
    const { t } = useTranslation();

    return (
        <div className="card-body d-flex flex-column">
            <div className="setting-header d-flex">
                <ul className="nav nav-tabs ">
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'g' ?
                            'active' : 'highlight-border-bottom'}`}
                            onClick={() => setTabType('g')}>
                            {t('general')}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'b' ?
                            'active' : 'highlight-border-bottom'}`}
                            onClick={() => setTabType('b')}>
                            {t('bible')}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'a' ?
                            'active' : 'highlight-border-bottom'}`}
                            onClick={() => setTabType('a')}>
                            {t('about')}
                        </button>
                    </li>
                </ul>
            </div>
            <div className="setting-body flex-fill flex h">
                {tabType === 'g' && <SettingGeneral />}
                {tabType === 'b' && <SettingBible />}
                {tabType === 'a' && <SettingAbout />}
            </div>
        </div>
    );
}
