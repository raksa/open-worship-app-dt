import KeyboardEventListener, {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    addBibleItem, updateBibleItem,
} from '../bible-list/bibleHelpers';
import ScreenFTManager from '../_screen/ScreenFTManager';
import { usePopupWindowsTypeData } from '../app-modal/helpers';
import BibleItem from '../bible-list/BibleItem';
import {
    genContextMenuItemShortcutKey, ContextMenuItemType,
} from '../others/AppContextMenu';
import { showSimpleToast } from '../toast/toastHelpers';
import { getIsKeepingPopup } from './RenderExtraLeftButtons';
import {
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import appProvider from '../server/appProvider';
import { useShowBibleSearchContext } from '../others/commonButtons';

const presenterEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl', 'Shift'],
    key: 'Enter',
};

const addListEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 'Enter',
};

export default function RenderActionButtons() {
    const bibleItem = useBibleItemContext();
    const { data } = usePopupWindowsTypeData();
    const isBibleEditor = !!data;
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
            {!appProvider.isPagePresenter ? null : <button type='button'
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
    event: any, bibleItem: BibleItem, onDone: () => void,
) {
    const addedBibleItem = await addBibleItem(bibleItem, onDone);
    if (addedBibleItem !== null) {
        ScreenFTManager.ftBibleItemSelect(
            event, [addedBibleItem],
        );
    } else {
        showAddingBibleItemFail();
    }
}

export function useFoundActionKeyboard(bibleItem: BibleItem) {
    const hideBibleSearchPopup = useShowBibleSearchContext(false);
    const isKeepingPopup = getIsKeepingPopup();
    const onDone = (
        !isKeepingPopup && hideBibleSearchPopup !== null ?
            hideBibleSearchPopup : () => false
    );
    SearchBibleItemViewController.getInstance().onSearchAddBibleItem = onDone;
    useKeyboardRegistering([addListEventMapper], () => {
        addBibleItem(bibleItem, onDone).then((addedBibleItem) => {
            if (addedBibleItem === null) {
                showAddingBibleItemFail();
            }
        });
    });
    useKeyboardRegistering([presenterEventMapper], (event) => {
        if (!appProvider.isPagePresenter) {
            return;
        }
        addBibleItemAndPresent(event, bibleItem, onDone);
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
    bibleItem: BibleItem, onDone: () => void, isKeyboardShortcut?: boolean,
): ContextMenuItemType[] {
    // TODO: fix slide select editing
    if (appProvider.isPageEditor) {
        return [];
    }
    return [
        {
            menuTitle: 'Add bible item',
            otherChild: isKeyboardShortcut ? (
                genContextMenuItemShortcutKey(addListEventMapper)
            ) : undefined,
            onClick: async () => {
                const addedBibleItem = await addBibleItem(bibleItem, onDone);
                if (addedBibleItem === null) {
                    showAddingBibleItemFail();
                }
            },
        },
        ...(appProvider.isPagePresenter ? [
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
                    addBibleItemAndPresent(event, bibleItem, onDone);
                },
            },
        ] : []),
    ];
}
