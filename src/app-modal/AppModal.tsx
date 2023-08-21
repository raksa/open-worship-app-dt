import BibleSearchPopup from '../bible-search/BibleSearchPopup';
import SettingPopup from '../setting/SettingPopup';
import {
    AppModalType,
    APP_MODAL_ROUTE_PATH as ROOT_APP_MODAL_ROUTE_PATH,
    useModalTypeData,
} from './helpers';

export const APP_MODAL_QUERY_ROUTE_PATH = `${ROOT_APP_MODAL_ROUTE_PATH}:query`;

export default function AppModal() {
    const { modalType } = useModalTypeData();
    if (modalType === AppModalType.BIBLE_SEARCH) {
        return (
            <BibleSearchPopup />
        );
    } else if (modalType === AppModalType.SETTING) {
        return (
            <SettingPopup />
        );
    }
    return null;
}
