import Bible from './Bible';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';
import { moveBibleItemTo } from './bibleHelpers';
import BibleItem from './BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { AnyObjectType } from '../helper/helpers';
import { BibleTargetType } from './bibleRenderHelpers';
import { genShowOnScreensContextMenu } from '../others/FileItemHandlerComp';
import ScreenBibleManager from '../_screen/managers/ScreenBibleManager';
import LookupBibleItemController from '../bible-reader/LookupBibleItemController';
import { genContextMenuItemIcon } from '../context-menu/AppContextMenuComp';

export type BibleItemType = {
    id: number;
    bibleKey: string;
    target: BibleTargetType;
    metadata: AnyObjectType;
};

export function genDefaultBibleItemContextMenu(
    bibleItem: BibleItem,
): ContextMenuItemType[] {
    return [
        {
            childBefore: genContextMenuItemIcon('copy', {
                color: 'var(--bs-secondary-text-emphasis)',
            }),
            menuTitle: '`' + 'Copy Title',
            onSelect: () => {
                bibleItem.copyTitleToClipboard();
            },
        },
        {
            childBefore: genContextMenuItemIcon('copy', {
                color: 'var(--bs-secondary-text-emphasis)',
            }),
            menuTitle: '`' + 'Copy Text',
            onSelect: () => {
                bibleItem.copyTextToClipboard();
            },
        },
        {
            childBefore: genContextMenuItemIcon('copy', {
                color: 'var(--bs-secondary-text-emphasis)',
            }),
            menuTitle: '`' + 'Copy All',
            onSelect: () => {
                bibleItem.copyToClipboard();
            },
        },
    ];
}

export async function openBibleItemContextMenu(
    event: any,
    bibleItem: BibleItem,
    index: number,
    openBibleLookup: (() => void) | null,
    extraMenuItems: ContextMenuItemType[],
) {
    const bible = bibleItem.filePath
        ? await Bible.fromFilePath(bibleItem.filePath)
        : null;
    if (bible === null) {
        showSimpleToast('Open Bible Item Context Menu', 'Unable to get bible');
        return;
    }
    const menuItem: ContextMenuItemType[] = [
        ...genDefaultBibleItemContextMenu(bibleItem),
        ...(openBibleLookup !== null
            ? [
                  {
                      menuTitle: '`' + 'Lookup',
                      onSelect: async () => {
                          const viewController =
                              new LookupBibleItemController();
                          viewController.applyTargetOrBibleKey(
                              viewController.selectedBibleItem,
                              {
                                  bibleKey: bibleItem.bibleKey,
                              },
                          );
                          await viewController.setLookupContentFromBibleItem(
                              bibleItem,
                          );
                      },
                  },
              ]
            : []),
        {
            menuTitle: '`' + 'Duplicate',
            onSelect: () => {
                bible.duplicate(index);
                bible.save();
            },
        },
        ...genShowOnScreensContextMenu((event) => {
            ScreenBibleManager.handleBibleItemSelecting(event, bibleItem, true);
        }),
        {
            menuTitle: '`' + 'Move To',
            onSelect: (event1: any) => {
                moveBibleItemTo(event1, bible, index);
            },
        },
        {
            menuTitle: '`' + 'Delete',
            onSelect: () => {
                bible.deleteItemAtIndex(index);
                bible.save();
            },
        },
    ];
    if (index !== 0) {
        menuItem.push({
            menuTitle: '`' + 'Move up',
            onSelect: () => {
                bible.swapItem(index, index - 1);
                bible.save();
            },
        });
    }
    if (index !== bible.itemsLength - 1) {
        menuItem.push({
            menuTitle: '`' + 'Move down',
            onSelect: () => {
                bible.swapItem(index, index + 1);
                bible.save();
            },
        });
    }
    showAppContextMenu(event, [...extraMenuItems, ...menuItem]);
}

export function genDuplicatedMessage(
    list: BibleItem[],
    { target }: BibleItem,
    i: number,
) {
    let warningMessage;
    const duplicated = list.find(({ target: target1 }, i1) => {
        return (
            target.bookKey === target1.bookKey &&
            target.chapter === target1.chapter &&
            target.verseStart === target1.verseStart &&
            target.verseEnd === target1.verseEnd &&
            i !== i1
        );
    });
    if (duplicated) {
        const itemNum = list.indexOf(duplicated) + 1;
        warningMessage = `Duplicated with item number ${itemNum}`;
    }
    return warningMessage;
}
