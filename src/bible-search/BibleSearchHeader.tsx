import KeyboardEventListener, {
    EventMapper as KBEventMapper,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { tran } from '../lang';
import { openBibleSearch } from './HandleBibleSearch';

export default function BibleSearchHeader() {
    const eventMapper: KBEventMapper = {
        wControlKey: ['Ctrl'],
        mControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        key: 'b',
    };
    useKeyboardRegistering(eventMapper, openBibleSearch);
    return (
        <button className='btn btn-labeled btn-primary'
            style={{
                width: '220px',
            }}
            onClick={openBibleSearch}
            data-tool-tip={KeyboardEventListener.toShortcutKey(eventMapper)}
            type='button'>
            <span className='btn-label'>
                <i className='bi bi-book' />
            </span>
            {tran('bible-search')}
        </button>
    );
}
