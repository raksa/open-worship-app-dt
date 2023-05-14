import KeyboardEventListener, {
    EventMapper as KBEventMapper,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { isWindowEditingMode, isWindowPresentingMode } from '../App';
import BibleItem from '../bible-list/BibleItem';
import SlideItem from '../slide-list/SlideItem';
import {
    addBibleItem,
    AddBiblePropsType,
} from '../helper/bible-helpers/bibleHelpers';
import PresentFTManager from '../_present/PresentFTManager';

const presentEventMapper: KBEventMapper = {
    wControlKey: ['Ctrl', 'Shift'],
    mControlKey: ['Ctrl', 'Shift'],
    lControlKey: ['Ctrl', 'Shift'],
    key: 'Enter',
};

const addListEventMapper: KBEventMapper = {
    wControlKey: ['Ctrl'],
    mControlKey: ['Ctrl'],
    lControlKey: ['Ctrl'],
    key: 'Enter',
};

export default function RenderActionButtons(props: AddBiblePropsType) {
    const isBibleSelectEditing = !!BibleItem.getSelectedEditingResult();
    const isSlideSelectEditing = !!SlideItem.getSelectedEditingResult();
    const isWindowEditing = isWindowEditingMode();
    const isWindowPresenting = isWindowPresentingMode();
    const addBibleItemAndPresent = async (event: any) => {
        const bibleItem = await addBibleItem(props);
        if (bibleItem !== null) {
            if (isWindowPresenting) {
                PresentFTManager.ftBibleItemSelect(event, [bibleItem]);
            }
        }
    };
    useKeyboardRegistering(addListEventMapper, () => {
        addBibleItem(props);
    });
    useKeyboardRegistering(presentEventMapper, addBibleItemAndPresent);
    const getAddingTitle = () => {
        if (isWindowEditing) {
            return 'Add to Slide';
        }
        return isBibleSelectEditing ? 'Save Bible Item' : 'Add Bible Item';
    };
    return (
        <div className='btn-group mx-1'>
            {isWindowEditing && !isSlideSelectEditing ? null :
                <button type='button'
                    className='btn btn-sm btn-info'
                    onClick={() => {
                        addBibleItem(props);
                    }}
                    data-tool-tip={KeyboardEventListener
                        .toShortcutKey(addListEventMapper)}>
                    <i className='bi bi-plus-lg' />
                    {getAddingTitle()}
                </button>}
            {isWindowPresenting && <button type='button'
                className='btn btn-sm btn-info ms-1'
                onClick={addBibleItemAndPresent}
                data-tool-tip={KeyboardEventListener
                    .toShortcutKey(presentEventMapper)}>
                <i className='bi bi-easel' />
                {isBibleSelectEditing ? 'Save and Present' : 'Present'}
            </button>}
        </div>
    );
}
