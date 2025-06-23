import {
    EventMapper as KeyboardEventMapper,
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
import { useLookupBibleItemControllerContext } from '../bible-reader/LookupBibleItemController';

export const presenterEventMapper: KeyboardEventMapper = {
    allControlKey: ['Ctrl', 'Shift'],
    key: 'Enter',
};

export const addListEventMapper: KeyboardEventMapper = {
    allControlKey: ['Ctrl'],
    key: 'Enter',
};

function showAddingBibleItemFail() {
    showSimpleToast('Adding Bible Item', 'Fail to add bible item');
}

export async function addBibleItemAndPresent(
    event: any,
    bibleItem: BibleItem,
    onDone?: () => void,
) {
    const addedBibleItem = await saveBibleItem(bibleItem, onDone);
    if (addedBibleItem !== null) {
        ScreenBibleManager.handleBibleItemSelecting(event, addedBibleItem);
    } else {
        showAddingBibleItemFail();
    }
}

export function checkHideBibleLookupPopup(
    hideBibleLookupPopup: (() => void) | null,
) {
    const isKeepingPopup = getIsKeepingPopup();
    if (!isKeepingPopup) {
        hideBibleLookupPopup?.();
    }
}

export function useFoundActionKeyboard(bibleItem: BibleItem) {
    const viewController = useLookupBibleItemControllerContext();
    const hideBibleLookupPopup = useShowBibleLookupContext(false);
    viewController.onLookupSaveBibleItem = checkHideBibleLookupPopup.bind(
        null,
        hideBibleLookupPopup,
    );
    useKeyboardRegistering(
        [addListEventMapper],
        async () => {
            const addedBibleItem = await saveBibleItem(
                bibleItem,
                viewController.onLookupSaveBibleItem,
            );
            if (addedBibleItem === null) {
                showAddingBibleItemFail();
            }
        },
        [bibleItem, checkHideBibleLookupPopup],
    );
    useKeyboardRegistering(
        [presenterEventMapper],
        (event) => {
            if (!appProvider.isPagePresenter) {
                return;
            }
            addBibleItemAndPresent(
                event,
                bibleItem,
                viewController.onLookupSaveBibleItem,
            );
        },
        [bibleItem, checkHideBibleLookupPopup],
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
                      childBefore: genContextMenuItemIcon('display'),
                      menuElement: '`Show bible item',
                      onSelect: (event: any) => {
                          ScreenBibleManager.handleBibleItemSelecting(
                              event,
                              bibleItem,
                          );
                          onDone();
                      },
                  },
                  {
                      childAfter: isKeyboardShortcut
                          ? genContextMenuItemShortcutKey(presenterEventMapper)
                          : undefined,
                      menuElement: '`Save bible item and show on screen',
                      onSelect: async (event: any) => {
                          addBibleItemAndPresent(event, bibleItem, onDone);
                      },
                  },
              ]
            : []),
    ];
}
