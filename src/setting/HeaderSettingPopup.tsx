import {
    EventMapper as KBEventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';

export default function HeaderSettingPopup({
    onClose,
}: {
    onClose: () => void,
}) {
    const eventMapper: KBEventMapper = {
        wControlKey: ['Ctrl'],
        mControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        key: 'q',
    };
    useKeyboardRegistering(eventMapper, onClose);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-gear-wide-connected' />Setting
            </span>
            <button type='button' onClick={onClose}
                data-tool-tip={toShortcutKey(eventMapper)}
                className='btn-close float-end' />
        </div>
    );
}
