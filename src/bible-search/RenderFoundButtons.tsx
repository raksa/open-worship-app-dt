import KeyboardEventListener, {
    EventMapper as KBEventMapper,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { isWindowEditingMode } from '../App';
import { bookToKey } from '../server/bible-helpers/helpers1';
import ToastEventListener from '../event/ToastEventListener';
import Bible from '../bible-list/Bible';
import BibleItem from '../bible-list/BibleItem';
import { ConsumeVerseType } from './RenderFound';
import SlideItem from '../slide-list/SlideItem';
import { closeBibleSearch } from './HandleBibleSearch';

export default function RenderFoundButtons({
    found, book, chapter,
    bibleSelected,
}: {
    found: ConsumeVerseType,
    book: string,
    chapter: number,
    bibleSelected: string,
}) {
    const isBibleSelectEditing = !!BibleItem.getSelectedEditingResult();
    const isSlideSelectEditing = !!SlideItem.getSelectedEditingResult();
    const isWindowEditing = isWindowEditingMode();
    const addListEventMapper: KBEventMapper = {
        wControlKey: ['Ctrl'],
        mControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        key: 'Enter',
    };
    const addBibleItem = async () => {
        const key = await bookToKey(bibleSelected, book);
        if (key === null) {
            return null;
        }
        const bibleItem = BibleItem.fromJson({
            id: -1,
            bibleName: bibleSelected,
            target: {
                book: key,
                chapter,
                startVerse: found.sVerse,
                endVerse: found.eVerse,
            },
            metadata: {},
        });
        if (isWindowEditing) {
            const canvasController = await import('../slide-editor/canvas/CanvasController') as any;
            canvasController?.addNewBibleItem(bibleItem);
            closeBibleSearch();
            return null;
        }
        const savedBibleItem = await Bible.updateOrToDefault(bibleItem);
        if (savedBibleItem !== null) {
            closeBibleSearch();
            return savedBibleItem;
        } else {
            ToastEventListener.showSimpleToast({
                title: 'Adding bible',
                message: 'Fail to add bible to list',
            });
        }
        return null;
    };
    const addBibleItemAndPresent = async () => {
        const bibleItem = await addBibleItem();
        if (bibleItem !== null) {
            bibleItem.isSelected = true;
        }
    };
    const presentEventMapper: KBEventMapper = {
        wControlKey: ['Ctrl', 'Shift'],
        mControlKey: ['Ctrl', 'Shift'],
        lControlKey: ['Ctrl', 'Shift'],
        key: 'Enter',
    };
    useKeyboardRegistering(addListEventMapper, addBibleItem);
    useKeyboardRegistering(presentEventMapper, addBibleItemAndPresent);
    const getAddingTitle = () => {
        if (isWindowEditing) {
            return 'Add to Slide';
        }
        return isBibleSelectEditing ? 'Save Bible Item' : 'Add Bible Item';
    };
    return (
        <div className='card-footer bg-transparent border-success d-flex justify-content-evenly'>
            {isWindowEditing && !isSlideSelectEditing ? null :
                <button type='button'
                    className='tool-tip tool-tip-fade btn btn-sm btn-primary ms-5 me-5'
                    onClick={addBibleItem}
                    data-tool-tip={KeyboardEventListener
                        .toShortcutKey(addListEventMapper)}>
                    {getAddingTitle()}
                </button>}
            {!isWindowEditing && <button type='button'
                className='tool-tip tool-tip-fade btn btn-sm btn-primary ms-5 me-5'
                onClick={addBibleItemAndPresent}
                data-tool-tip={KeyboardEventListener
                    .toShortcutKey(presentEventMapper)}>
                {isBibleSelectEditing ? 'Save and Present' : 'Present'}
            </button>}
        </div>
    );
}
