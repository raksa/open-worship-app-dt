import React from 'react';
import bibleHelper from '../bible-helper/bibleHelpers';
import BibleItem from '../bible-list/BibleItem';
import {
    StateEnum,
    useWindowEvent,
    WindowEnum,
    windowEventListener,
} from '../event/WindowEventListener';
import { useStateSettingBoolean } from '../helper/settingHelper';
import { openSetting } from '../setting/HandleSetting';

const BibleSearchPopup = React.lazy(() => import('./BibleSearchPopup'));

export const openBibleSearchEvent = {
    window: WindowEnum.BibleSearch,
    state: StateEnum.Open,
};
export const closeBibleSearchEvent = {
    window: WindowEnum.BibleSearch,
    state: StateEnum.Close,
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
        <React.Suspense fallback={<div>Loading...</div>}>
            <BibleSearchPopup />
        </React.Suspense>
    );
}
