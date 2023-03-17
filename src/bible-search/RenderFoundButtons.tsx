import KeyboardEventListener, {
    EventMapper as KBEventMapper,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { isWindowEditingMode } from '../App';
import BibleItem from '../bible-list/BibleItem';
import SlideItem from '../slide-list/SlideItem';
import {
    addBibleItem,
    AddBiblePropsType,
} from './bibleHelpers';

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

export default function RenderFoundButtons(props: AddBiblePropsType) {
    const isBibleSelectEditing = !!BibleItem.getSelectedEditingResult();
    const isSlideSelectEditing = !!SlideItem.getSelectedEditingResult();
    const isWindowEditing = isWindowEditingMode();
    const addBibleItemAndPresent = async () => {
        const bibleItem = await addBibleItem(props);
        if (bibleItem !== null) {
            bibleItem.isSelected = true;
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
        <div className={'card-footer bg-transparent border-success '
            + 'd-flex justify-content-evenly'}>
            {isWindowEditing && !isSlideSelectEditing ? null :
                <button type='button'
                    className='btn btn-sm btn-primary ms-5 me-5'
                    onClick={() => {
                        addBibleItem(props);
                    }}
                    data-tool-tip={KeyboardEventListener
                        .toShortcutKey(addListEventMapper)}>
                    {getAddingTitle()}
                </button>}
            {!isWindowEditing && <button type='button'
                className='btn btn-sm btn-primary ms-5 me-5'
                onClick={addBibleItemAndPresent}
                data-tool-tip={KeyboardEventListener
                    .toShortcutKey(presentEventMapper)}>
                {isBibleSelectEditing ? 'Save and Present' : 'Present'}
            </button>}
        </div>
    );
}
