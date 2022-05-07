import './SettingPopup.scss';

import HeaderEditorPopup from './HeaderSettingPopup';
import { StateEnum, WindowEnum, windowEventListener } from '../event/WindowEventListener';
import Modal from '../others/Modal';
import { SettingGeneral } from './SettingGeneral';
import { SettingBible } from './SettingBible';
import { SettingAbout } from './SettingAbout';
import { useStateSettingString } from '../helper/settingHelper';
import { useTranslation } from 'react-i18next';

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
function Setting() {
    const { t } = useTranslation();
    // g: general, b: bible, a: about
    const [tabType, setTabType] = useStateSettingString('popup-setting-tab', 'b');

    return (
        <div className="card-body d-flex flex-column">
            <div className="setting-header d-flex">
                <ul className="nav nav-tabs ">
                    {[['g', 'General'], ['b', 'Bible'], ['a', 'About']].map(([key, title], i) => {
                        return (<li key={i} className="nav-item">
                            <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                                onClick={() => setTabType(key)}>
                                {t(title)}
                            </button>
                        </li>);
                    })}
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
