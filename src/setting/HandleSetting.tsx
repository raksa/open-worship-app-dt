import { useState } from 'react';
import { useWindowEvent } from '../event/WindowEventListener';
import SettingPopup, { closeSettingEvent, openSettingEvent } from './SettingPopup';

export default function HandleSetting() {
    const [isShowing, setIsShowing] = useState(false);
    useWindowEvent(openSettingEvent, () => setIsShowing(true));
    useWindowEvent(closeSettingEvent, () => setIsShowing(false));
    return isShowing ? <SettingPopup /> : null;
}
