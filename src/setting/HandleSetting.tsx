import React, { useState } from 'react';
import {
    StateEnum,
    useWindowEvent,
    WindowEnum,
    windowEventListener,
} from '../event/WindowEventListener';

const SettingPopup = React.lazy(() => import('./SettingPopup'));

export const openSettingEvent = {
    window: WindowEnum.Setting,
    state: StateEnum.Open,
};
export const closeSettingEvent = {
    window: WindowEnum.Setting,
    state: StateEnum.Close,
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
        <React.Suspense fallback={<div>Loading...</div>}>
            <SettingPopup />
        </React.Suspense>
    );
}
