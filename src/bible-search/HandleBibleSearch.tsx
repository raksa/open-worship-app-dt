import React from 'react';
import bibleHelper from '../bible-helper/bibleHelpers';
import BibleItem from '../bible-list/BibleItem';
import {
    useWindowEvent,
    windowEventListener,
    EventMapper as WEventMapper,
} from '../event/WindowEventListener';
import { useStateSettingBoolean } from '../helper/settingHelper';
import AppSuspense from '../others/AppSuspense';
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
    windowEventListener.fireEvent(openBibleSearchEvent);
}
export function closeBibleSearch() {
    windowEventListener.fireEvent(closeBibleSearchEvent);
    BibleItem.setSelectedEditingItem(null);
}

export default function HandleBibleSearch() {
    const [isShowing, setIsShowing] = useStateSettingBoolean('showing-bible-search-popup');
    const openBibleSearchPopup = async () => {
        const list = await bibleHelper.getDownloadedBibleList();
        if (list.length) {
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
