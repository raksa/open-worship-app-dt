import {
    EventMapper as KBEventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { addBibleItem, updateBibleItem } from '../bible-list/bibleHelpers';
import ScreenBibleManager from '../_screen/managers/ScreenBibleManager';
import { getPopupWindowTypeData } from '../app-modal/helpers';
import BibleItem from '../bible-list/BibleItem';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { getIsKeepingPopup } from './RenderExtraButtonsRightComp';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import appProvider from '../server/appProvider';
import { useShowBibleLookupContext } from '../others/commonButtons';
import { genContextMenuItemShortcutKey } from '../context-menu/AppContextMenuComp';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';

const presenterEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl', 'Shift'],
    key: 'Enter',
};

const addListEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 'Enter',
};

export default function RenderActionButtonsComp() {
    const bibleItem = useBibleItemContext();
    const { data } = getPopupWindowTypeData();
    const isBibleEditor = !!data;
    if (!isBibleEditor) {
        return null;
    }
    const addingListShortcutKey = toShortcutKey(addListEventMapper);
    const savingAndShowingShortcutKey = toShortcutKey(presenterEventMapper);
    return (
        <div className="btn-group mx-1">
            <button
                type="button"
                className="btn btn-sm btn-info"
                title={`Save bible item [${addingListShortcutKey}]`}
                onClick={() => {
                    updateBibleItem(bibleItem, data);
                }}
            >
                <i className="bi bi-floppy" />
            </button>
            {!appProvider.isPagePresenter ? null : (
                <button
                    type="button"
                    className="btn btn-sm btn-info ms-1"
                    title={
                        'Save bible item and show on screen ' +
                        `[${savingAndShowingShortcutKey}]`
                    }
                    onClick={(event) => {
                        const updatedBibleItem = updateBibleItem(
                            bibleItem,
                            data,
                        );
                        if (updatedBibleItem !== null) {
                            ScreenBibleManager.handleBibleItemSelecting(
                                event,
                                bibleItem,
                            );
                        } else {
                            showSimpleToast(
                                'Update Bible Item',
                                'Fail to update bible item',
                            );
                        }
                    }}
                >
                    <i className="bi bi-floppy" />
                    <i className="bi bi-easel" />
                </button>
            )}
        </div>
    );
}

function showAddingBibleItemFail() {
    showSimpleToast('Adding Bible Item', 'Fail to add bible item');
}

async function addBibleItemAndPresent(
    event: any,
    bibleItem: BibleItem,
    onDone: () => void,
) {
    const addedBibleItem = await addBibleItem(bibleItem, onDone);
    if (addedBibleItem !== null) {
        ScreenBibleManager.handleBibleItemSelecting(event, addedBibleItem);
    } else {
        showAddingBibleItemFail();
    }
}

export function useFoundActionKeyboard(bibleItem: BibleItem) {
    const hideBibleLookupPopup = useShowBibleLookupContext(false);
    const isKeepingPopup = getIsKeepingPopup();
    const onDone =
        !isKeepingPopup && hideBibleLookupPopup !== null
            ? hideBibleLookupPopup
            : () => false;
    LookupBibleItemViewController.getInstance().onLookupAddBibleItem = onDone;
    useKeyboardRegistering(
        [addListEventMapper],
        async () => {
            const addedBibleItem = await addBibleItem(bibleItem, onDone);
            if (addedBibleItem === null) {
                showAddingBibleItemFail();
            }
        },
        [bibleItem, onDone],
    );
    useKeyboardRegistering(
        [presenterEventMapper],
        (event) => {
            if (!appProvider.isPagePresenter) {
                return;
            }
            addBibleItemAndPresent(event, bibleItem, onDone);
        },
        [bibleItem, onDone],
    );
}

export function genFoundBibleItemContextMenu(
    bibleItem: BibleItem,
    onDone: () => void,
    isKeyboardShortcut?: boolean,
): ContextMenuItemType[] {
    // TODO: fix slide select editing
    if (appProvider.isPageEditor) {
        return [];
    }
    return [
        {
            menuTitle: 'Add bible item',
            otherChild: isKeyboardShortcut
                ? genContextMenuItemShortcutKey(addListEventMapper)
                : undefined,
            onSelect: async () => {
                const addedBibleItem = await addBibleItem(bibleItem, onDone);
                if (addedBibleItem === null) {
                    showAddingBibleItemFail();
                }
            },
        },
        ...(appProvider.isPagePresenter
            ? [
                  {
                      menuTitle: 'Show bible item',
                      onSelect: (event: any) => {
                          ScreenBibleManager.handleBibleItemSelecting(
                              event,
                              bibleItem,
                          );
                      },
                  },
                  {
                      otherChild: isKeyboardShortcut
                          ? genContextMenuItemShortcutKey(presenterEventMapper)
                          : undefined,
                      menuTitle: 'Add bible item and show on screen',
                      onSelect: async (event: any) => {
                          addBibleItemAndPresent(event, bibleItem, onDone);
                      },
                  },
              ]
            : []),
    ];
}
