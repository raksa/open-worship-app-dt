import { useState } from 'react';

import Bible from './Bible';
import { WindowModEnum } from '../router/routeHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import { moveBibleItemTo } from './bibleHelpers';
import BibleItem from './BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { AnyObjectType } from '../helper/helpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { BibleTargetType } from './bibleRenderHelpers';
import { toInputText } from '../helper/bible-helpers/serverBibleHelpers2';

export type BibleItemType = {
    id: number,
    bibleKey: string,
    target: BibleTargetType,
    metadata: AnyObjectType,
}

export function genDefaultBibleItemContextMenu(bibleItem: BibleItem) {
    return [
        {
            title: '(*T) ' + 'Copy Title',
            onClick: () => {
                bibleItem.copyTitleToClipboard();
            },
        },
        {
            title: '(*T) ' + 'Copy Text',
            onClick: () => {
                bibleItem.copyTextToClipboard();
            },
        },
        {
            title: '(*T) ' + 'Copy All',
            onClick: () => {
                bibleItem.copyToClipboard();
            },
        },
    ];
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
        ...genDefaultBibleItemContextMenu(bibleItem),
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
        return target.bookKey === target1.bookKey &&
            target.chapter === target1.chapter &&
            target.verseStart === target1.verseStart &&
            target.verseEnd === target1.verseEnd && i !== i1;
    });
    if (duplicated) {
        const itemNum = list.indexOf(duplicated) + 1;
        warningMessage = `Duplicated with item number ${itemNum}`;
    }
    return warningMessage;
}


export function useBibleItemRenderTitle(bibleItem: BibleItem,) {
    const [title, setTitle] = useState<string>('');
    useAppEffect(() => {
        bibleItem.toTitle().then((text) => {
            setTitle(text);
        });
    }, [bibleItem]);
    return title;
}
export function useBibleItemRenderText(bibleItem: BibleItem) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        bibleItem.toText().then((text) => {
            setText(text);
        });
    }, [bibleItem]);
    return text;
}
export function useBibleItemVerseTextList(bibleItem: BibleItem) {
    const [result, setResult] = useState<[string, string][] | null>(null);
    useAppEffect(() => {
        bibleItem.toVerseTextList().then((result) => {
            setResult(result);
        });
    }, [bibleItem]);
    return result;
}

export function useBibleItemPropsToInputText(
    bibleKey: string, book?: string | null, chapter?: number | null,
    verseStart?: number | null, verseEnd?: number | null,
) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        toInputText(bibleKey, book, chapter, verseStart, verseEnd)
            .then((text1) => {
                setText(text1);
            });
    }, [bibleKey, book, chapter, verseStart, verseEnd]);
    return text;
}
