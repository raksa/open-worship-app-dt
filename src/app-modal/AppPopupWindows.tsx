import BibleSearchPopup from '../bible-search/BibleSearchPopup';
import { useBibleSearchShowingContext } from '../others/commonButtons';

export default function AppPopupWindows() {
    const { isShowing: isBibleSearchShowing } = useBibleSearchShowingContext();
    if (isBibleSearchShowing) {
        return (
            <BibleSearchPopup />
        );
    }
    return null;
}
