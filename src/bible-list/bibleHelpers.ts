import { createContext, use, useState } from 'react';

import { getSetting, setSetting } from '../helper/settingHelpers';
import BibleItem from './BibleItem';
import {
    checkIsBookAvailable,
    getVerses,
    keyToBook,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    extractBibleTitle,
    toInputText,
    toLocaleNumBible,
} from '../helper/bible-helpers/serverBibleHelpers2';
import { getAllLocalBibleInfoList } from '../helper/bible-helpers/bibleDownloadHelpers';
import Bible from './Bible';
import { showSimpleToast } from '../toast/toastHelpers';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import DirSource from '../helper/DirSource';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import { addExtension } from '../server/fileHelpers';
import appProvider from '../server/appProvider';
import { VerseList } from '../helper/bible-helpers/BibleDataReader';

export const SELECTED_BIBLE_SETTING_NAME = 'selected-bible';

async function getSelectedEditorBibleItem() {
    const localBibleInfoList = await getAllLocalBibleInfoList();
    let bibleKey = getSetting(SELECTED_BIBLE_SETTING_NAME) || null;
    if (bibleKey === null) {
        if (!localBibleInfoList?.length) {
            showSimpleToast(
                'Getting Selected Bible',
                'Unable to get selected bible',
            );
            return null;
        }
        bibleKey = localBibleInfoList[0].key;
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleKey);
    } else if (
        localBibleInfoList?.find((bibleInfo) => {
            return bibleInfo.key === bibleKey;
        }) === undefined
    ) {
        bibleKey = 'KJV';
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleKey);
    }
    return bibleKey;
}
export const SelectedBibleKeyContext = createContext<string>('KJV');
export function useBibleKeyContext() {
    return use(SelectedBibleKeyContext);
}

const DEFAULT_UNKNOWN_BIBLE_KEY = 'Unknown';
export function useSelectedBibleKey() {
    const [isValid, setIsValid] = useState(true);
    const [bibleKeySelected, setBibleKeySelected] = useState<string>(
        DEFAULT_UNKNOWN_BIBLE_KEY,
    );
    const setBibleKeySelected1 = (bibleKey: string | null) => {
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleKey ?? '');
        getAllLocalBibleInfoList().then((localBibleInfoList) => {
            if (
                localBibleInfoList?.find((bibleInfo) => {
                    return bibleInfo.key === bibleKey;
                }) === undefined
            ) {
                setIsValid(false);
                showSimpleToast('Setting Bible Key', 'Invalid bible key');
            } else {
                setIsValid(true);
            }
            setBibleKeySelected(bibleKey ?? DEFAULT_UNKNOWN_BIBLE_KEY);
        });
    };
    useAppEffectAsync(
        async (methodContext) => {
            const bibleKey = await getSelectedEditorBibleItem();
            methodContext.setBibleKeySelected1(bibleKey);
        },
        [],
        { setBibleKeySelected1 },
    );
    return {
        isValid,
        bibleKey: bibleKeySelected,
        setBibleKey: setBibleKeySelected1,
    };
}

export function useGetDefaultInputText(bibleItem: BibleItem | null) {
    const [inputText, setInputText] = useState<string>('');
    useAppEffectAsync(
        async (methodContext) => {
            if (bibleItem !== null) {
                const title = await bibleItem.toTitle();
                methodContext.setInputText(title);
            }
        },
        [bibleItem],
        { setInputText },
    );
    return [inputText, setInputText] as [string, (s: string) => void];
}

export async function genInputText(
    oldBibleKey: string,
    bibleKey: string,
    inputText: string,
) {
    const { result } = await extractBibleTitle(oldBibleKey, inputText);
    const { bookKey, chapter, bibleItem } = result;
    const target = bibleItem?.target;
    if (bookKey !== null && (await checkIsBookAvailable(bibleKey, bookKey))) {
        const newBook = await keyToBook(bibleKey, bookKey);
        return toInputText(
            bibleKey,
            newBook,
            chapter,
            target?.verseStart,
            target?.verseEnd,
        );
    }
    return inputText;
}

export async function updateBibleItem(bibleItem: BibleItem, data: string) {
    const messageTitle = 'Saving Bible Item Failed';
    const oldBibleItem = BibleItem.parseBibleLookupData(data);
    if (!oldBibleItem?.filePath) {
        showSimpleToast(messageTitle, 'Invalid bible item data');
        return null;
    }
    const bible = await Bible.fromFilePath(oldBibleItem.filePath);
    if (bible === null) {
        showSimpleToast(messageTitle, 'Fail to read bible file');
        return null;
    }
    const isSaved = await BibleItem.saveFromBibleLookup(
        bible,
        oldBibleItem,
        bibleItem,
    );
    if (isSaved) {
        showSimpleToast(messageTitle, 'Bible item saved successfully!');
    }
    return bibleItem;
}

export async function addBibleItem(bibleItem: BibleItem, onDone: () => void) {
    if (appProvider.isPageEditor) {
        // TODO: Implement this, find canvasController
        // canvasController.addNewBibleItem(bibleItem);
        return null;
    }
    const savedBibleItem = await Bible.addBibleItemToDefault(bibleItem);
    if (savedBibleItem !== null) {
        showSimpleToast('Adding bible', 'Bible item is added');
        onDone?.();
        return savedBibleItem;
    } else {
        showSimpleToast('Adding bible', 'Fail to add bible to list');
    }
    return null;
}

export type ConsumeVerseType = {
    sVerse: number;
    eVerse: number;
    verses: VerseList;
};
export async function genVerseList({
    bibleKey,
    bookKey,
    chapter,
}: {
    bibleKey: string;
    bookKey: string;
    chapter: number;
}) {
    const verses = await getVerses(bibleKey, bookKey, chapter);
    if (verses === null) {
        return null;
    }
    const verseNumbList = await Promise.all(
        Array.from({ length: Object.keys(verses).length }, (_, i) => {
            return toLocaleNumBible(bibleKey, i + 1);
        }),
    );
    const verseList = verseNumbList.map((verseNumSting, i) => {
        return [i + 1, verseNumSting];
    });
    return verseList.filter(([_, verseNumSting]) => {
        return verseNumSting !== null;
    }) as [number, string][];
}

export async function moveBibleItemTo(
    event: any,
    bible: Bible,
    index?: number,
) {
    const dirSource = await DirSource.getInstance(
        Bible.getDirSourceSettingName(),
    );
    dirSource.getFilePaths('bible').then((filePaths) => {
        const targetNames = (filePaths ?? [])
            .map((filePath) => {
                return FileSource.getInstance(filePath).name;
            })
            .filter((name) => {
                const fileSource = FileSource.getInstance(bible.filePath);
                return name !== fileSource.name;
            });
        if (targetNames.length === 0) {
            showSimpleToast('Move Bible Item', 'No other bibles found');
            return;
        }
        showAppContextMenu(
            event,
            targetNames.map((name) => {
                return {
                    menuTitle: name,
                    onSelect: async () => {
                        const bibleFileSource = FileSource.getInstance(
                            bible.filePath,
                        );
                        const { basePath, extension } = bibleFileSource;
                        const fileSource = FileSource.getInstance(
                            basePath,
                            addExtension(name, extension),
                        );
                        const targetBible = await Bible.fromFilePath(
                            fileSource.filePath,
                        );
                        if (!targetBible) {
                            showSimpleToast(
                                'Move Bible Item',
                                'Target bible not found',
                            );
                            return;
                        }
                        targetBible.moveItemFrom(bible.filePath, index);
                    },
                };
            }),
        );
    });
}
