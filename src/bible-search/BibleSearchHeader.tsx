import {
    EventMapper as KBEventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { tran } from '../lang';
import LinkToAppModal, {
    useOpenAppModal,
} from '../app-modal/LinkToAppModal';
import { AppModalType } from '../app-modal/helpers';
import BibleItem from '../bible-list/BibleItem';

export function useOpenBibleSearch(bibleItem?: BibleItem) {
    const data = bibleItem && BibleItem.genBibleSearchData(bibleItem);
    return useOpenAppModal(AppModalType.BIBLE_SEARCH, data);
}

const openBibleEventMap: KBEventMapper = {
    wControlKey: ['Ctrl'],
    mControlKey: ['Ctrl'],
    lControlKey: ['Ctrl'],
    key: 'b',
};
export default function BibleSearchHeader() {
    const openBibleSearch = useOpenBibleSearch();
    useKeyboardRegistering([openBibleEventMap], openBibleSearch);
    return (
        <LinkToAppModal modalType={AppModalType.BIBLE_SEARCH}>
            <button className='btn btn-labeled btn-primary'
                style={{ width: '220px' }}
                data-tool-tip={toShortcutKey(openBibleEventMap)}
                type='button'>
                <span className='btn-label'>
                    <i className='bi bi-book' />
                </span>
                {tran('bible-search')}
            </button>
        </LinkToAppModal>
    );
}
