import Bible from './Bible';
import { WindowModEnum } from '../router/routeHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import { moveBibleItemTo } from './bibleHelpers';
import BibleItem from './BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { AnyObjectType } from '../helper/helpers';

export type BibleTargetType = {
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
};
export type BibleItemType = {
    id: number,
    bibleKey: string,
    target: BibleTargetType,
    metadata: AnyObjectType,
}

export async function openBibleItemContextMenu(
    event: any, bibleItem: BibleItem, index: number,
    windowMode: WindowModEnum | null, openBibleSearch: () => void,
) {
    const bible = await Bible.readFileToData(bibleItem.filePath ?? null);
    if (!bible) {
        showSimpleToast('Open Bible Item Context Menu', 'Unable to get bible');
        return;
    }
    const menuItem = [
        {
            title: '(*T) ' + 'Quick Edit',
            onClick: () => {
                openBibleSearch();
            },
        },
        {
            title: '(*T) ' + 'Duplicate',
            onClick: () => {
                bible.duplicate(index);
                bible.save();
            },
        },
        {
            title: '(*T) ' + 'Move To',
            onClick: (event1: any) => {
                moveBibleItemTo(event1, bible, windowMode, index);
            },
        },
        {
            title: '(*T) ' + 'Delete',
            onClick: () => {
                bible.removeItemAtIndex(index);
                bible.save();
            },
        },
    ];
    if (index !== 0) {
        menuItem.push({
            title: '(*T) ' + 'Move up',
            onClick: () => {
                bible.swapItem(index, index - 1);
                bible.save();
            },
        });
    }
    if (index !== bible.itemsLength - 1) {
        menuItem.push({
            title: '(*T) ' + 'Move down',
            onClick: () => {
                bible.swapItem(index, index + 1);
                bible.save();
            },
        });
    }
    showAppContextMenu(event, menuItem);
}

export function genDuplicatedMessage(list: BibleItem[],
    { target }: BibleItem, i: number) {
    let warningMessage;
    const duplicated = list.find(({ target: target1 }, i1) => {
        return target.book === target1.book &&
            target.chapter === target1.chapter &&
            target.startVerse === target1.startVerse &&
            target.endVerse === target1.endVerse && i !== i1;
    });
    if (duplicated) {
        const itemNum = list.indexOf(duplicated) + 1;
        warningMessage = `Duplicated with item number ${itemNum}`;
    }
    return warningMessage;
}
