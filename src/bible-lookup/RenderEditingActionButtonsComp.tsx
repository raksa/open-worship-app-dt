import {
    EventMapper as KeyboardEventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { saveBibleItem } from '../bible-list/bibleHelpers';
import ScreenBibleManager from '../_screen/managers/ScreenBibleManager';
import BibleItem from '../bible-list/BibleItem';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { getIsKeepingPopup } from './RenderExtraButtonsRightComp';
import appProvider from '../server/appProvider';
import { useShowBibleLookupContext } from '../others/commonButtons';
import {
    elementDivider,
    genContextMenuItemIcon,
    genContextMenuItemShortcutKey,
} from '../context-menu/AppContextMenuComp';
import {
    ctrlShiftMetaKeys,
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';
import { useMemo } from 'react';
import { useBibleItemsViewControllerContext } from '../bible-reader/BibleItemsViewController';

const presenterEventMapper: KeyboardEventMapper = {
    allControlKey: ['Ctrl', 'Shift'],
    key: 'Enter',
};

const addListEventMapper: KeyboardEventMapper = {
    allControlKey: ['Ctrl'],
    key: 'Enter',
};

export default function RenderEditingActionButtonsComp({
    bibleItem,
}: Readonly<{ bibleItem: BibleItem }>) {
    const eventMaps = useMemo(() => {
        return ['s', 'v'].map((key) => {
            return { ...ctrlShiftMetaKeys, key };
        });
    }, []);
    const viewController = useBibleItemsViewControllerContext();
    useFoundActionKeyboard(bibleItem);
    useKeyboardRegistering(
        eventMaps,
        (event) => {
            if (event.key.toLowerCase() === 's') {
                viewController.addBibleItemLeft(bibleItem, bibleItem);
            } else {
                viewController.addBibleItemBottom(bibleItem, bibleItem);
            }
        },
        [],
    );
    return (
        <div className="btn-group mx-1">
            <button
                type="button"
                className="btn btn-sm btn-info"
                title={`Split horizontal [${toShortcutKey(eventMaps[0])}]`}
                onClick={() => {
                    viewController.addBibleItemLeft(bibleItem, bibleItem);
                }}
            >
                <i className="bi bi-vr" />
            </button>
            <button
                type="button"
                className="btn btn-sm btn-info"
                title={`Split vertical [${toShortcutKey(eventMaps[1])}]`}
                onClick={() => {
                    viewController.addBibleItemBottom(bibleItem, bibleItem);
                }}
            >
                <i className="bi bi-hr" />
            </button>
            <button
                type="button"
                className="btn btn-sm btn-info"
                title={`Save bible item [${toShortcutKey(addListEventMapper)}]`}
                onClick={() => {
                    saveBibleItem(bibleItem);
                }}
            >
                <i className="bi bi-floppy" />
            </button>
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
    const addedBibleItem = await saveBibleItem(bibleItem, onDone);
    if (addedBibleItem !== null) {
        ScreenBibleManager.handleBibleItemSelecting(event, addedBibleItem);
    } else {
        showAddingBibleItemFail();
    }
}

export function useFoundActionKeyboard(bibleItem: BibleItem) {
    const viewController = useLookupBibleItemControllerContext();
    const hideBibleLookupPopup = useShowBibleLookupContext(false);
    const isKeepingPopup = getIsKeepingPopup();
    const onDone =
        !isKeepingPopup && hideBibleLookupPopup !== null
            ? hideBibleLookupPopup
            : () => false;
    viewController.onLookupAddBibleItem = onDone;
    useKeyboardRegistering(
        [addListEventMapper],
        async () => {
            const addedBibleItem = await saveBibleItem(bibleItem, onDone);
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
            menuElement: elementDivider,
        },
        {
            childBefore: genContextMenuItemIcon('floppy'),
            menuElement: '`Save bible item',
            childAfter: isKeyboardShortcut
                ? genContextMenuItemShortcutKey(addListEventMapper)
                : undefined,
            onSelect: async () => {
                const addedBibleItem = await saveBibleItem(bibleItem, onDone);
                if (addedBibleItem === null) {
                    showAddingBibleItemFail();
                }
            },
        },
        ...(appProvider.isPagePresenter
            ? [
                  {
                      menuElement: 'Show bible item',
                      onSelect: (event: any) => {
                          ScreenBibleManager.handleBibleItemSelecting(
                              event,
                              bibleItem,
                          );
                      },
                  },
                  {
                      childAfter: isKeyboardShortcut
                          ? genContextMenuItemShortcutKey(presenterEventMapper)
                          : undefined,
                      menuElement: 'Save bible item and show on screen',
                      onSelect: async (event: any) => {
                          addBibleItemAndPresent(event, bibleItem, onDone);
                      },
                  },
              ]
            : []),
    ];
}
