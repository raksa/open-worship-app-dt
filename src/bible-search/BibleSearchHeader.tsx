import { useTranslation } from 'react-i18next';
import {
    EventMapper as KBEventMapper,
    keyboardEventListener,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { openBibleSearch } from './HandleBibleSearch';

export default function BibleSearchHeader() {
    const { t } = useTranslation();
    const eventMapper: KBEventMapper = {
        wControlKey: ['Ctrl'],
        mControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        key: 'b',
    };
    useKeyboardRegistering(eventMapper, openBibleSearch);
    return (
        <button className='tool-tip tool-tip-fade btn btn-labeled btn-primary'
            style={{
                width: '220px',
            }}
            onClick={openBibleSearch}
            data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
            type='button'>
            <span className='btn-label'>
                <i className='bi bi-book'></i>
            </span>
            {t('bible-search')}
        </button>
    );
}
