import BibleLookupPopupComp from '../bible-loopup/BibleLookupPopupComp';
import { useBibleLookupShowingContext } from '../others/commonButtons';

export default function AppPopupWindowsComp() {
    const { isShowing: isBibleLookupShowing } = useBibleLookupShowingContext();
    if (isBibleLookupShowing) {
        return <BibleLookupPopupComp />;
    }
    return null;
}
