import {
    useKeyboardRegistering,
    EventMapper as KBEventMapper,
    toShortcutKey,
} from '../event/KeyboardEventListener';
import { tran } from '../lang';
import {
    closeItemSlideEdit,
} from '../slide-presenting/HandleItemSlideEdit';

export default function SlideItemEditorPopupHeader() {
    const eventMapper: KBEventMapper = {
        wControlKey: ['Ctrl'],
        mControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        key: 'q',
    };
    useKeyboardRegistering(eventMapper, closeItemSlideEdit);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-pencil-square' />
                {tran('edit-item-thumb')}
            </span>
            <button type='button' onClick={closeItemSlideEdit}
                data-tool-tip={toShortcutKey(eventMapper)}
                className='btn-close float-end' />
        </div>
    );
}
