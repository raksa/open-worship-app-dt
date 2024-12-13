import { getSetting, setSetting } from '../helper/settingHelpers';

const SETTING_NAME = 'popup-window-type-data';
export function getPopupWindowTypeData() {
    return JSON.parse(getSetting(SETTING_NAME) || '{}');
}
export function setPopupWindowTypeData(modalType: string, data: string) {
    setSetting(SETTING_NAME, JSON.stringify({ modalType, data }));
}
