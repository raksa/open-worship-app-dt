import { useState } from 'react';
import Bible from './Bible';
import { WindowModEnum } from '../router/routeHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import { moveBibleItemTo } from './bibleHelpers';
import BibleItem from './BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { AnyObjectType } from '../helper/helpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    BibleTargetType, bibleRenderHelper,
} from './bibleRenderHelpers';
import {
    toInputText,
} from '../helper/bible-helpers/serverBibleHelpers2';

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


function useBibleItemRender(
    item: BibleItem, convertCallback: () => Promise<string>, htmlID?: string,
) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        const htmlContainer = htmlID ? document.getElementById(htmlID) : null;
        if (htmlContainer !== null) {
            htmlContainer.innerHTML = 'Loading...';
        }
        convertCallback().then((text1) => {
            setText(text1);
            if (htmlContainer !== null) {
                htmlContainer.innerHTML = text1;
            }
        });
    }, [item]);
    return text;
}
export function useBibleItemRenderTitle(item: BibleItem, htmlID?: string) {
    return useBibleItemRender(item, () => {
        return item.toTitle();
    }, htmlID);
}
export function useBibleItemRenderText(item: BibleItem, htmlID?: string) {
    return useBibleItemRender(item, () => {
        return item.toText();
    }, htmlID);
}

export function useBibleItemPropsToInputText(
    bibleKey: string, book?: string | null, chapter?: number | null,
    startVerse?: number | null, endVerse?: number | null,
) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        toInputText(bibleKey, book, chapter, startVerse, endVerse)
            .then((text1) => {
                setText(text1);
            });
    }, [bibleKey, book, chapter, startVerse, endVerse]);
    return text;
}
