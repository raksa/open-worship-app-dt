import BibleSearchPopup from '../bible-search/BibleSearchPopup';
import SettingPopup from '../setting/SettingPopup';
import {
    AppPopupWindowsType, APP_MODAL_ROUTE_PATH as ROOT_APP_MODAL_ROUTE_PATH,
    usePopupWindowsTypeData,
} from './helpers';

export const APP_MODAL_QUERY_ROUTE_PATH = `${ROOT_APP_MODAL_ROUTE_PATH}:query`;

export default function AppPopupWindows() {
    const { modalType: popupType } = usePopupWindowsTypeData();
    if (popupType === AppPopupWindowsType.BIBLE_SEARCH) {
        return (
            <BibleSearchPopup />
        );
    } else if (popupType === AppPopupWindowsType.SETTING) {
        return (
            <SettingPopup />
        );
    }
    return null;
}
