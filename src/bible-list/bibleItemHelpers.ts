import { useState } from 'react';

import Bible from './Bible';
import { WindowModEnum } from '../router/routeHelpers';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import { moveBibleItemTo } from './bibleHelpers';
import BibleItem from './BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { AnyObjectType } from '../helper/helpers';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { BibleTargetType } from './bibleRenderHelpers';
import { toInputText } from '../helper/bible-helpers/serverBibleHelpers2';

export type BibleItemType = {
    id: number,
    bibleKey: string,
    target: BibleTargetType,
    metadata: AnyObjectType,
}

export function genDefaultBibleItemContextMenu(
    bibleItem: BibleItem,
): ContextMenuItemType[] {
    return [
        {
            menuTitle: '(*T) ' + 'Copy Title',
            onClick: () => {
                bibleItem.copyTitleToClipboard();
            },
        },
        {
            menuTitle: '(*T) ' + 'Copy Text',
            onClick: () => {
                bibleItem.copyTextToClipboard();
            },
        },
        {
            menuTitle: '(*T) ' + 'Copy All',
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
    const menuItem: ContextMenuItemType[] = [
        ...genDefaultBibleItemContextMenu(bibleItem),
        {
            menuTitle: '(*T) ' + 'Quick Edit',
            onClick: () => {
                openBibleSearch();
            },
        },
        {
            menuTitle: '(*T) ' + 'Duplicate',
            onClick: () => {
                bible.duplicate(index);
                bible.save();
            },
        },
        {
            menuTitle: '(*T) ' + 'Move To',
            onClick: (event1: any) => {
                moveBibleItemTo(event1, bible, windowMode, index);
            },
        },
        {
            menuTitle: '(*T) ' + 'Delete',
            onClick: () => {
                bible.removeItemAtIndex(index);
                bible.save();
            },
        },
    ];
    if (index !== 0) {
        menuItem.push({
            menuTitle: '(*T) ' + 'Move up',
            onClick: () => {
                bible.swapItem(index, index - 1);
                bible.save();
            },
        });
    }
    if (index !== bible.itemsLength - 1) {
        menuItem.push({
            menuTitle: '(*T) ' + 'Move down',
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


export function useBibleItemRenderTitle(bibleItem: BibleItem) {
    const [title, setTitle] = useState<string>('');
    useAppEffectAsync(async (methodContext) => {
        const title = await bibleItem.toTitle();
        methodContext.setTitle(title);
    }, [bibleItem], { methods: { setTitle } });
    return title;
}
export function useBibleItemRenderText(bibleItem: BibleItem) {
    const [text, setText] = useState<string>('');
    useAppEffectAsync(async (methodContext) => {
        const text = await bibleItem.toText();
        methodContext.setText(text);
    }, [bibleItem], { methods: { setText } });
    return text;
}
export function useBibleItemVerseTextList(bibleItem: BibleItem) {
    const [result, setResult] = useState<[string, string][] | null>(null);
    useAppEffectAsync(async (methodContext) => {
        const result = await bibleItem.toVerseTextList();
        methodContext.setResult(result);
    }, [bibleItem], { methods: { setResult } });
    return result;
}

export function useBibleItemPropsToInputText(
    bibleKey: string, book?: string | null, chapter?: number | null,
    verseStart?: number | null, verseEnd?: number | null,
) {
    const [text, setText] = useState<string>('');
    useAppEffectAsync(async (methodContext) => {
        const text1 = await toInputText(
            bibleKey, book, chapter, verseStart, verseEnd,
        );
        methodContext.setText(text1);
    },
        [bibleKey, book, chapter, verseStart, verseEnd],
        { methods: { setText } },
    );
    return text;
}
