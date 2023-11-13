import { useCallback } from 'react';
import KeyboardEventListener, {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import SlideItem from '../slide-list/SlideItem';
import {
    addBibleItem, updateBibleItem,
} from '../bible-list/bibleHelpers';
import PresentFTManager from '../_present/PresentFTManager';
import {
    useWindowIsEditingMode, useWindowIsPresentingMode, useWindowMode,
} from '../router/routeHelpers';
import { useModalTypeData } from '../app-modal/helpers';
import { useCloseAppModal } from '../app-modal/LinkToAppModal';
import {
    getIsKeepWindowOpen,
} from './RenderKeepWindowOpen';
import BibleItem from '../bible-list/BibleItem';

const presentEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl', 'Shift'],
    key: 'Enter',
};

const addListEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 'Enter',
};

export default function RenderActionButtons({ bibleItem }: Readonly<{
    bibleItem: BibleItem,
}>) {
    const closeModal = useCloseAppModal();
    const windowMode = useWindowMode();
    const { data } = useModalTypeData();
    const isBibleEditing = !!data;
    // TODO: fix slide select editing
    const isSlideSelectEditing = !!SlideItem.getSelectedEditingResult();
    const isWindowEditing = useWindowIsEditingMode();
    const isWindowPresenting = useWindowIsPresentingMode();
    const addOrUpdateBibleItem = useCallback(async () => {
        const isKeepWindowOpen = getIsKeepWindowOpen();
        if (!isKeepWindowOpen) {
            closeModal();
        }
        if (isBibleEditing) {
            return updateBibleItem(bibleItem, data);
        } else {
            return addBibleItem(bibleItem, windowMode);
        }
    }, [bibleItem, data, isBibleEditing, closeModal, windowMode]);
    const addBibleItemAndPresent = useCallback(async (event: any) => {
        const bibleItem = await addOrUpdateBibleItem();
        if (bibleItem !== null) {
            if (isWindowPresenting) {
                PresentFTManager.ftBibleItemSelect(event, [bibleItem]);
            }
        }
    }, [addOrUpdateBibleItem, isWindowPresenting]);
    useKeyboardRegistering([addListEventMapper], () => {
        addOrUpdateBibleItem();
    });
    useKeyboardRegistering([presentEventMapper], (event) => {
        addBibleItemAndPresent(event);
    });
    const genSaveOrAdd = () => {
        return isBibleEditing ? 'Save' : 'Add';
    };
    const genAddingTitle = () => {
        if (isWindowEditing) {
            return 'Add to Slide';
        }
        return `${genSaveOrAdd()} bible item`;
    };
    const genPresentTitle = () => {
        return `${genSaveOrAdd()} and present`;;
    };
    return (
        <div className='btn-group mx-1'>
            {isWindowEditing && !isSlideSelectEditing ? null :
                <button type='button'
                    className='btn btn-sm btn-info'
                    onClick={addOrUpdateBibleItem}
                    data-tool-tip={
                        `${genAddingTitle()} [${KeyboardEventListener
                            .toShortcutKey(addListEventMapper)}]`
                    }>
                    <i className='bi bi-plus-lg' />
                </button>}
            {isWindowPresenting && <button type='button'
                className='btn btn-sm btn-info ms-1'
                onClick={addBibleItemAndPresent}
                data-tool-tip={
                    `${genPresentTitle()} [${KeyboardEventListener
                        .toShortcutKey(presentEventMapper)}]`
                }>
                <i className='bi bi-plus-lg' />
                <i className='bi bi-easel' />
            </button>}
        </div>
    );
}
