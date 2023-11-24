import {
    EventMapper as KBEventMapper, toShortcutKey, useKeyboardRegistering,
} from '../event/KeyboardEventListener';

const openSettingEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 'q',
};
export default function HeaderSettingPopup({
    onClose,
}: Readonly<{
    onClose: () => void,
}>) {
    useKeyboardRegistering([openSettingEventMapper], onClose);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-gear-wide-connected' />Setting
            </span>
            <button type='button' onClick={onClose}
                data-tool-tip={toShortcutKey(openSettingEventMapper)}
                className='btn-close float-end' />
        </div>
    );
}
