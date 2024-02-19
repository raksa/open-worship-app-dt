import KeyboardEventListener, {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import SlideItem from '../slide-list/SlideItem';
import {
    addBibleItem, updateBibleItem,
} from '../bible-list/bibleHelpers';
import PresentFTManager from '../_present/PresentFTManager';
import {
    WindowModEnum, checkIsWindowEditingMode, checkIsWindowPresentingMode,
    useWindowIsPresentingMode, useWindowMode,
} from '../router/routeHelpers';
import { useModalTypeData } from '../app-modal/helpers';
import BibleItem from '../bible-list/BibleItem';
import { ContextMenuItemType } from '../others/AppContextMenu';
import { showSimpleToast } from '../toast/toastHelpers';
import { useCloseAppModal } from '../app-modal/LinkToAppModal';
import { getIsKeepWindowOpen } from './RenderKeepWindowOpen';

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
    const { data } = useModalTypeData();
    const isBibleEditing = !!data;
    const isWindowPresenting = useWindowIsPresentingMode();
    if (!isBibleEditing) {
        return null;
    }
    return (
        <div className='btn-group mx-1'>
            <button type='button'
                className='btn btn-sm btn-info'
                onClick={() => {
                    updateBibleItem(bibleItem, data);
                }}
                data-tool-tip={
                    `Save bible item [${KeyboardEventListener.
                        toShortcutKey(addListEventMapper)}]`
                }>
                <i className='bi bi-floppy' />
            </button>
            {!isWindowPresenting ? null : <button type='button'
                className='btn btn-sm btn-info ms-1'
                onClick={(event) => {
                    const updatedBibleItem = updateBibleItem(
                        bibleItem, data,
                    );
                    if (updatedBibleItem !== null) {
                        PresentFTManager.ftBibleItemSelect(
                            event, [bibleItem],
                        );
                    } else {
                        showSimpleToast(
                            'Update Bible Item',
                            'Fail to update bible item',
                        );
                    }
                }}
                data-tool-tip={
                    `Save bible item and present [${KeyboardEventListener.
                        toShortcutKey(presentEventMapper)}]`
                }>
                <i className='bi bi-floppy' />
                <i className='bi bi-easel' />
            </button>}
        </div>
    );
}

function showAddingBibleItemFail() {
    showSimpleToast(
        'Adding Bible Item', 'Fail to add bible item',
    );
}

async function addBibleItemAndPresent(
    event: any, bibleItem: BibleItem, windowMode: WindowModEnum,
    onDone?: () => void,
) {
    const addedBibleItem = await addBibleItem(
        bibleItem, windowMode,
    );
    if (addedBibleItem !== null) {
        PresentFTManager.ftBibleItemSelect(
            event, [addedBibleItem],
        );
        onDone?.();
    } else {
        showAddingBibleItemFail();
    }
}

export function useFoundActionKeyboard(bibleItem: BibleItem) {
    const closeModal = useCloseAppModal();
    const windowMode = useWindowMode();
    const isWindowPresenting = useWindowIsPresentingMode();
    const isKeepWindowOpen = getIsKeepWindowOpen();
    const onDone = isKeepWindowOpen ? () => false : closeModal;
    useKeyboardRegistering([addListEventMapper], () => {
        addBibleItem(bibleItem, windowMode).then((addedBibleItem) => {
            if (addedBibleItem !== null) {
                onDone();
            } else {
                showAddingBibleItemFail();
            }
        });
    });
    useKeyboardRegistering([presentEventMapper], (event) => {
        if (!isWindowPresenting || windowMode === null) {
            return;
        }
        addBibleItemAndPresent(
            event, bibleItem, windowMode, onDone,
        );
    });
}

function toShortcutKey(
    eventMapper: KBEventMapper, isKeyboardShortcut?: boolean,
) {
    if (!isKeyboardShortcut) {
        return '';
    }
    return KeyboardEventListener.toShortcutKey(eventMapper);
}

export function genFoundBibleItemContextMenu(
    bibleItem: BibleItem, windowMode: WindowModEnum,
    isKeyboardShortcut?: boolean,
): ContextMenuItemType[] {
    // TODO: fix slide select editing
    const isSlideSelectEditing = !!SlideItem.getSelectedEditingResult();
    const isWindowEditing = checkIsWindowEditingMode(windowMode);
    const isWindowPresenting = checkIsWindowPresentingMode(windowMode);
    if (isWindowEditing && !isSlideSelectEditing) {
        return [];
    }
    return [
        {
            title: `Add bible item ${toShortcutKey(
                addListEventMapper, isKeyboardShortcut,
            )}`,
            onClick: () => {
                addBibleItem(bibleItem, windowMode);
                addBibleItem(bibleItem, windowMode).then((addedBibleItem) => {
                    if (addedBibleItem === null) {
                        showAddingBibleItemFail();
                    }
                });
            },
        },
        ...(isWindowPresenting ? [
            {
                title: 'Present bible item',
                onClick: (event: any) => {
                    PresentFTManager.ftBibleItemSelect(event, [bibleItem]);
                },
            },
            {
                title: `Add bible item and present ${toShortcutKey(
                    presentEventMapper, isKeyboardShortcut,
                )}`,
                onClick: async (event: any) => {
                    addBibleItemAndPresent(
                        event, bibleItem, windowMode,
                    );
                },
            },
        ] : []),
    ];
}
