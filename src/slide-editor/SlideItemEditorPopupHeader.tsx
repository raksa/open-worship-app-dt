import KeyboardEventListener, {
    useKeyboardRegistering,
    EventMapper as KBEventMapper,
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
                <i className='bi bi-pencil-square'></i>
                {tran('edit-item-thumb')}
            </span>
            <button type='button' onClick={closeItemSlideEdit}
                data-tool-tip={KeyboardEventListener.toShortcutKey(eventMapper)}
                className='tool-tip tool-tip-fade tool-tip-left btn-close float-end'></button>
        </div>
    );
}
