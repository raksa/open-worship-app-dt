import BibleSearchPopupComp from '../bible-search/BibleSearchPopupComp';
import { useBibleSearchShowingContext } from '../others/commonButtons';

export default function AppPopupWindowsComp() {
    const { isShowing: isBibleSearchShowing } = useBibleSearchShowingContext();
    if (isBibleSearchShowing) {
        return <BibleSearchPopupComp />;
    }
    return null;
}
