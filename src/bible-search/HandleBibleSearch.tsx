import React from 'react';
import BibleItem from '../bible-list/BibleItem';
import WindowEventListener, {
    useWindowEvent,
    EventMapper as WEventMapper,
} from '../event/WindowEventListener';
import { useStateSettingBoolean } from '../helper/settingHelper';
import AppSuspense from '../others/AppSuspense';
import { getDownloadedBibleList } from '../server/bible-helpers/bibleHelpers';
import { openSetting } from '../setting/HandleSetting';

const BibleSearchPopup = React.lazy(() => import('./BibleSearchPopup'));

export const openBibleSearchEvent: WEventMapper = {
    widget: 'bible-search',
    state: 'open',
};
export const closeBibleSearchEvent: WEventMapper = {
    widget: 'bible-search',
    state: 'close',
};
export function openBibleSearch() {
    WindowEventListener.fireEvent(openBibleSearchEvent);
}
export function closeBibleSearch() {
    WindowEventListener.fireEvent(closeBibleSearchEvent);
    BibleItem.setSelectedEditingItem(null);
}

export default function HandleBibleSearch() {
    const [isShowing, setIsShowing] = useStateSettingBoolean('showing-bible-search-popup');
    const openBibleSearchPopup = async () => {
        const downloadedBibleList = await getDownloadedBibleList();
        if (downloadedBibleList === null || downloadedBibleList.length) {
            setIsShowing(true);
        } else {
            openSetting();
        }
    };
    useWindowEvent(openBibleSearchEvent, openBibleSearchPopup);
    useWindowEvent(closeBibleSearchEvent, () => setIsShowing(false));
    if (!isShowing) {
        return null;
    }
    return (
        <AppSuspense>
            <BibleSearchPopup />
        </AppSuspense>
    );
}
