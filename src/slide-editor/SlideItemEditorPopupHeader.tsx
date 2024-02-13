import {
    useKeyboardRegistering, EventMapper as KBEventMapper, toShortcutKey,
} from '../event/KeyboardEventListener';
import { tran } from '../lang';
import {
    closeItemSlideEdit,
} from '../slide-presenting/HandleItemSlideEdit';

const closeEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 'q',
};
export default function SlideItemEditorPopupHeader() {
    useKeyboardRegistering([closeEventMapper], closeItemSlideEdit);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-pencil-square' />
                {tran('edit-item-thumb')}
            </span>
            <button type='button' onClick={closeItemSlideEdit}
                data-tool-tip={toShortcutKey(closeEventMapper)}
                className='btn-close float-end' />
        </div>
    );
}
