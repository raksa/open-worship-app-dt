import {
    keyboardEventListener,
    KeyEnum,
    LinuxControlEnum,
    MacControlEnum,
    useKeyboardRegistering,
    WindowsControlEnum,
} from '../event/KeyboardEventListener';
import { closeBibleSearch } from './BibleSearchPopup';
import { fromLocaleNumber } from '../bible-helper/helpers2';
import { isWindowEditingMode } from '../App';
import { bookToKey } from '../bible-helper/helpers1';
import { toastEventListener } from '../event/ToastEventListener';
import Bible from '../bible-list/Bible';
import BibleItem from '../bible-list/BibleItem';
import { ConsumeVerseType } from './RenderFound';
import SlideItem from '../slide-list/SlideItem';

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
    const addListEventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: KeyEnum.Enter,
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
                chapter: await fromLocaleNumber(bibleSelected, chapter),
                startVerse: await fromLocaleNumber(bibleSelected, found.sVerse),
                endVerse: await fromLocaleNumber(bibleSelected, found.eVerse),
            },
        });
        if (isWindowEditing) {
            const slideItem = await SlideItem.getSelectedItem();
            slideItem?.canvasController.addNewBibleItem(bibleItem);
            closeBibleSearch();
            return null;
        }
        const savedBibleItem = await Bible.updateOrToDefault(bibleItem);
        if (savedBibleItem !== null) {
            closeBibleSearch();
            return savedBibleItem;
        } else {
            toastEventListener.showSimpleToast({
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
    const presentEventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl, WindowsControlEnum.Shift],
        mControlKey: [MacControlEnum.Ctrl, MacControlEnum.Shift],
        lControlKey: [LinuxControlEnum.Ctrl, LinuxControlEnum.Shift],
        key: KeyEnum.Enter,
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
                    data-tool-tip={keyboardEventListener
                        .toShortcutKey(addListEventMapper)}>
                    {getAddingTitle()}
                </button>}
            {!isWindowEditing && <button type='button'
                className='tool-tip tool-tip-fade btn btn-sm btn-primary ms-5 me-5'
                onClick={addBibleItemAndPresent}
                data-tool-tip={keyboardEventListener
                    .toShortcutKey(presentEventMapper)}>
                {isBibleSelectEditing ? 'Save and Present' : 'Present'}
            </button>}
        </div>
    );
}
