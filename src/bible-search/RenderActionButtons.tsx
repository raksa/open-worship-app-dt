import KeyboardEventListener, {
    EventMapper as KBEventMapper,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import SlideItem from '../slide-list/SlideItem';
import {
    addBibleItem,
    AddBiblePropsType,
} from '../helper/bible-helpers/bibleHelpers';
import PresentFTManager from '../_present/PresentFTManager';
import {
    useWindowIsEditingMode,
    useWindowIsPresentingMode,
} from '../router/routeHelpers';
import { useModalTypeData } from '../app-modal/helpers';
import BibleItem from '../bible-list/BibleItem';
import { useCloseAppModal } from '../app-modal/LinkToAppModal';

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
    const closeModal = useCloseAppModal();
    const { data } = useModalTypeData();
    const isBibleEditing = !!data;
    // TODO: fix slide select editing
    const isSlideSelectEditing = !!SlideItem.getSelectedEditingResult();
    const isWindowEditing = useWindowIsEditingMode();
    const isWindowPresenting = useWindowIsPresentingMode();
    const addOrBibleItem = async (props: AddBiblePropsType) => {
        closeModal();
        if (isBibleEditing) {
            BibleItem.saveFromBibleSearch(props, data);
            return null;
        } else {
            const bibleItem = await addBibleItem(props);
            return bibleItem;
        }
    };
    const addBibleItemAndPresent = (event: any) => {
        (async () => {
            const bibleItem = await addOrBibleItem(props);
            if (bibleItem !== null) {
                if (isWindowPresenting) {
                    PresentFTManager.ftBibleItemSelect(event, [bibleItem]);
                }
            }
        })();
    };
    useKeyboardRegistering(addListEventMapper, () => {
        addOrBibleItem(props);
    });
    useKeyboardRegistering(presentEventMapper, addBibleItemAndPresent);
    const getAddingTitle = () => {
        if (isWindowEditing) {
            return 'Add to Slide';
        }
        return isBibleEditing ? 'Save Bible Item' : 'Add Bible Item';
    };
    return (
        <div className='btn-group mx-1'>
            {isWindowEditing && !isSlideSelectEditing ? null :
                <button type='button'
                    className='btn btn-sm btn-info'
                    onClick={() => {
                        addOrBibleItem(props);
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
                {isBibleEditing ? 'Save and Present' : 'Present'}
            </button>}
        </div>
    );
}
