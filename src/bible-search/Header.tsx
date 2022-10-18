import KeyboardEventListener, {
    EventMapper,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { tran } from '../lang';
import { closeBibleSearch } from './HandleBibleSearch';

export default function Header() {
    const eventMapper: EventMapper = {
        wControlKey: ['Ctrl'],
        mControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        key: 'q',
    };
    useKeyboardRegistering(eventMapper, closeBibleSearch);
    return (
        <div className='card-header text-center w-100'>
            <span>📖 {tran('bible-search')}</span>
            <button type='button' onClick={closeBibleSearch}
                data-tool-tip={KeyboardEventListener.toShortcutKey(eventMapper)}
                className='tool-tip btn-close float-end'></button>
        </div>
    );
}
