import {
    EventMapper as KBEventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { closeSetting } from './HandleSetting';

export default function HeaderSettingPopup() {
    const eventMapper: KBEventMapper = {
        wControlKey: ['Ctrl'],
        mControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        key: 'q',
    };
    useKeyboardRegistering(eventMapper, closeSetting);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-gear-wide-connected' />Setting
            </span>
            <button type='button' onClick={closeSetting}
                data-tool-tip={toShortcutKey(eventMapper)}
                className='btn-close float-end' />
        </div>
    );
}
