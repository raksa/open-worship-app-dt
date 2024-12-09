import BibleSearchPopup from '../bible-search/BibleSearchPopup';
import {
    AppPopupWindowsType, APP_MODAL_ROUTE_PATH as ROOT_APP_MODAL_ROUTE_PATH,
    usePopupWindowsTypeData,
} from './helpers';

export const APP_MODAL_QUERY_ROUTE_PATH = `${ROOT_APP_MODAL_ROUTE_PATH}:query`;

export default function AppPopupWindows() {
    const { modalType } = usePopupWindowsTypeData();
    if (modalType === AppPopupWindowsType.BIBLE_SEARCH) {
        return (
            <BibleSearchPopup />
        );
    }
    return null;
}
