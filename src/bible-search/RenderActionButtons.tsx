import KeyboardEventListener, {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import SlideItem from '../slide-list/SlideItem';
import {
    addBibleItem, updateBibleItem,
} from '../bible-list/bibleHelpers';
import ScreenFTManager from '../_screen/ScreenFTManager';
import {
    WindowModEnum, checkIsWindowEditorMode, checkIsWindowPresenterMode,
    useWindowIsPresenterMode, useWindowMode,
} from '../router/routeHelpers';
import { usePopupWindowsTypeData } from '../app-modal/helpers';
import BibleItem from '../bible-list/BibleItem';
import {
    ContextMenuItemShortcutKey, ContextMenuItemType,
} from '../others/AppContextMenu';
import { showSimpleToast } from '../toast/toastHelpers';
import { useCloseAppModal } from '../app-modal/LinkToAppModal';
import { getIsKeepingPopup } from './RenderExtraLeftButtons';
import {
    SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';

const presenterEventMapper: KBEventMapper = {
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
    const { data } = usePopupWindowsTypeData();
    const isBibleEditor = !!data;
    const isWindowPresenter = useWindowIsPresenterMode();
    if (!isBibleEditor) {
        return null;
    }
    const addingListShortcutKey = KeyboardEventListener.toShortcutKey(
        addListEventMapper,
    );
    const savingAndShowingShortcutKey = KeyboardEventListener.toShortcutKey(
        presenterEventMapper,
    );
    return (
        <div className='btn-group mx-1'>
            <button type='button'
                className='btn btn-sm btn-info'
                onClick={() => {
                    updateBibleItem(bibleItem, data);
                }}
                data-tool-tip={`Save bible item [${addingListShortcutKey}]`}>
                <i className='bi bi-floppy' />
            </button>
            {!isWindowPresenter ? null : <button type='button'
                className='btn btn-sm btn-info ms-1'
                onClick={(event) => {
                    const updatedBibleItem = updateBibleItem(
                        bibleItem, data,
                    );
                    if (updatedBibleItem !== null) {
                        ScreenFTManager.ftBibleItemSelect(
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
                    'Save bible item and show on screen ' +
                    `[${savingAndShowingShortcutKey}]`
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
    onDone: () => void,
) {
    const addedBibleItem = await addBibleItem(
        bibleItem, windowMode, onDone,
    );
    if (addedBibleItem !== null) {
        ScreenFTManager.ftBibleItemSelect(
            event, [addedBibleItem],
        );
    } else {
        showAddingBibleItemFail();
    }
}

export function useFoundActionKeyboard(bibleItem: BibleItem) {
    const closeModal = useCloseAppModal();
    const windowMode = useWindowMode();
    const isWindowPresenter = useWindowIsPresenterMode();
    const isKeepingPopup = getIsKeepingPopup();
    const onDone = isKeepingPopup ? () => false : closeModal;
    SearchBibleItemViewController.getInstance().onSearchAddBibleItem = onDone;
    useKeyboardRegistering([addListEventMapper], () => {
        addBibleItem(bibleItem, windowMode, onDone).then((addedBibleItem) => {
            if (addedBibleItem === null) {
                showAddingBibleItemFail();
            }
        });
    });
    useKeyboardRegistering([presenterEventMapper], (event) => {
        if (!isWindowPresenter || windowMode === null) {
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
    return `[${KeyboardEventListener.toShortcutKey(eventMapper)}]`;
}

export function genFoundBibleItemContextMenu(
    bibleItem: BibleItem, windowMode: WindowModEnum,
    onDone: () => void, isKeyboardShortcut?: boolean,
): ContextMenuItemType[] {
    // TODO: fix slide select editing
    const isSlideSelectEditor = !!SlideItem.getSelectedEditingResult();
    const isWindowEditor = checkIsWindowEditorMode(windowMode);
    const isWindowPresenter = checkIsWindowPresenterMode(windowMode);
    if (isWindowEditor && !isSlideSelectEditor) {
        return [];
    }
    return [
        {
            menuTitle: 'Add bible item',
            otherChild: isKeyboardShortcut ? (
                <ContextMenuItemShortcutKey eventMapper={addListEventMapper} />
            ) : undefined,
            onClick: () => {
                addBibleItem(bibleItem, windowMode, onDone).
                    then((addedBibleItem) => {
                        if (addedBibleItem === null) {
                            showAddingBibleItemFail();
                        }
                    });
            },
        },
        ...(isWindowPresenter ? [
            {
                menuTitle: 'Show bible item',
                onClick: (event: any) => {
                    ScreenFTManager.ftBibleItemSelect(event, [bibleItem]);
                },
            },
            {
                menuTitle: `Add bible item and show on screen ${toShortcutKey(
                    presenterEventMapper, isKeyboardShortcut,
                )}`,
                onClick: async (event: any) => {
                    addBibleItemAndPresent(
                        event, bibleItem, windowMode, onDone,
                    );
                },
            },
        ] : []),
    ];
}
