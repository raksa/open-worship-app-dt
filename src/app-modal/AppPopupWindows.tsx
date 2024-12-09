import BibleSearchPopup from '../bible-search/BibleSearchPopup';
import { useBibleSearchShowingContext } from '../others/commonButtons';
import {
    APP_MODAL_ROUTE_PATH as ROOT_APP_MODAL_ROUTE_PATH,
} from './helpers';

export const APP_MODAL_QUERY_ROUTE_PATH = `${ROOT_APP_MODAL_ROUTE_PATH}:query`;

export default function AppPopupWindows() {
    const { isShowing: isBibleSearchShowing } = useBibleSearchShowingContext();
    if (isBibleSearchShowing) {
        return (
            <BibleSearchPopup />
        );
    }
    return null;
}
