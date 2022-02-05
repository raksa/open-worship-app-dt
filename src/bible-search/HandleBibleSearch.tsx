import bibleHelper from '../bible-helper/bibleHelper';
import { useWindowEvent } from '../event/WindowEventListener';
import { useStateSettingBoolean } from '../helper/settingHelper';
import { openSetting } from '../setting/SettingPopup';
import BibleSearchPopup, {
    closeBibleSearchEvent, openBibleSearchEvent,
} from './BibleSearchPopup';

export default function HandleBibleSearch() {
    const [isShowing, setIsShowing] = useStateSettingBoolean('showing-bible-search-popup');
    const openBibleSearchPopup = ()=>{
        const list = bibleHelper.getDownloadedBibleList();
        if(list.length) {
            setIsShowing(true);
        } else {
            openSetting();
        }
    };
    useWindowEvent(openBibleSearchEvent, openBibleSearchPopup);
    useWindowEvent(closeBibleSearchEvent, () => setIsShowing(false));
    return isShowing ? <BibleSearchPopup /> : null;
}
