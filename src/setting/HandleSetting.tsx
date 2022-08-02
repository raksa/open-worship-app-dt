import React, { useState } from 'react';
import {
    useWindowEvent,
    windowEventListener,
    EventMapper as WEventMapper,
} from '../event/WindowEventListener';
import AppSuspense from '../others/AppSuspense';

const SettingPopup = React.lazy(() => import('./SettingPopup'));

export const openSettingEvent: WEventMapper = {
    widget: 'setting',
    state: 'open',
};
export const closeSettingEvent: WEventMapper = {
    widget: 'setting',
    state: 'close',
};
export function openSetting() {
    windowEventListener.fireEvent(openSettingEvent);
}
export function closeSetting() {
    windowEventListener.fireEvent(closeSettingEvent);
}


export default function HandleSetting() {
    const [isShowing, setIsShowing] = useState(false);
    useWindowEvent(openSettingEvent, () => setIsShowing(true));
    useWindowEvent(closeSettingEvent, () => setIsShowing(false));
    if (!isShowing) {
        return null;
    }
    return (
        <AppSuspense>
            <SettingPopup />
        </AppSuspense>
    );
}
