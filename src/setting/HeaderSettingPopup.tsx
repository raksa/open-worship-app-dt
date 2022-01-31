import {
    keyboardEventListener,
    LinuxControlEnum,
    MacControlEnum,
    useKeyboardRegistering,
    WindowsControlEnum
} from '../event/KeyboardEventListener';
import { closeSetting } from './SettingPopup';

export default function HeaderSettingPopup() {
    const eventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: 'q',
    };
    useKeyboardRegistering(eventMapper, closeSetting);
    return (
        <div className="card-header text-center w-100">
            <span>
                <i className="bi bi-gear-wide-connected" />Setting
            </span>
            <button type="button" onClick={closeSetting}
                data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
                className="tool-tip tool-tip-fade tool-tip-left btn-close float-end"></button>
        </div>
    );
}
