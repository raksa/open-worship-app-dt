import { useState } from 'react';
import {
    getSetting, setSetting,
} from '../helper/settingHelper';
import BibleItem from './BibleItem';
import {
    VerseList, getVerses, keyToBook,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    extractBibleTitle, toInputText, toLocaleNumBB,
} from '../helper/bible-helpers/serverBibleHelpers2';
import {
    getDownloadedBibleInfoList,
} from '../helper/bible-helpers/bibleDownloadHelpers';
import Bible from './Bible';
import { showSimpleToast } from '../toast/toastHelpers';
import CanvasController from '../slide-editor/canvas/CanvasController';
import { useAppEffect } from '../helper/debuggerHelpers';
import DirSource from '../helper/DirSource';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';
import { addExtension } from '../server/fileHelper';
import {
    WindowModEnum, checkIsWindowEditingMode,
} from '../router/routeHelpers';

export const SELECTED_BIBLE_SETTING_NAME = 'selected-bible';

async function getSelectedEditingBibleItem() {
    let bibleKey = getSetting(SELECTED_BIBLE_SETTING_NAME) || null;
    if (bibleKey === null) {
        const downloadedBibleInfoList = await getDownloadedBibleInfoList();
        if (!downloadedBibleInfoList?.length) {
            showSimpleToast('Getting Selected Bible',
                'Unable to get selected bible');
            return null;
        }
        bibleKey = downloadedBibleInfoList[0].key;
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleKey);
    }
    return bibleKey;
}
export function useGetSelectedBibleKey() {
    const [bibleKeySelected, setBibleKeySelected] = useState<string | null>(
        null);
    const setBibleKeySelected1 = (bibleKey: string | null) => {
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleKey || '');
        setBibleKeySelected(bibleKey);
    };
    useAppEffect(() => {
        getSelectedEditingBibleItem().then((bibleKey) => {
            setBibleKeySelected1(bibleKey);
        });
    });
    return [bibleKeySelected, setBibleKeySelected1] as
        [string | null, (b: string | null) => void];
}

export function useGetDefaultInputText(bibleItem: BibleItem | null) {
    const [inputText, setInputText] = useState<string>('');
    useAppEffect(() => {
        if (bibleItem !== null) {
            bibleItem.toTitle().then((text) => {
                setInputText(text);
            });
        }
    }, [bibleItem]);
    return [inputText, setInputText] as [string, (s: string) => void];
}

export async function genInputText(
    oldBibleKey: string, newBibleKey: string, inputText: string,
) {
    const {
        bookKey, chapter, bibleItem,
    } = await extractBibleTitle(oldBibleKey, inputText);
    const target = bibleItem?.target;
    if (bookKey !== null) {
        const newBook = await keyToBook(newBibleKey, bookKey);
        return toInputText(
            newBibleKey, newBook, chapter, target?.verseStart,
            target?.verseEnd,
        );
    }
    return '';
}

export async function updateBibleItem(bibleItem: BibleItem, data: string) {
    const messageTitle = 'Saving Bible Item Failed';
    const oldBibleItem = BibleItem.parseBibleSearchData(data);
    if (!oldBibleItem?.filePath) {
        showSimpleToast(messageTitle, 'Invalid bible item data');
        return null;
    }
    const bible = await Bible.readFileToData(oldBibleItem.filePath);
    if (!bible) {
        showSimpleToast(messageTitle, 'Fail to read bible file');
        return null;
    }
    const isSaved = await BibleItem.saveFromBibleSearch(
        bible, oldBibleItem, bibleItem,
    );
    if (isSaved) {
        showSimpleToast(messageTitle, 'Bible item saved successfully!');
    }
    return bibleItem;
};

export async function addBibleItem(
    bibleItem: BibleItem, windowMode: WindowModEnum | null,
) {
    const isWindowEditing = checkIsWindowEditingMode();
    if (isWindowEditing) {
        const canvasController = CanvasController.getInstance();
        canvasController.addNewBibleItem(bibleItem);
        return null;
    }
    const savedBibleItem = await Bible.addBibleItemToDefault(
        bibleItem, windowMode,
    );
    if (savedBibleItem !== null) {
        showSimpleToast('Adding bible', 'Bible item is added');
        return savedBibleItem;
    } else {
        showSimpleToast('Adding bible', 'Fail to add bible to list');
    }
    return null;
};


export type ConsumeVerseType = {
    sVerse: number,
    eVerse: number,
    verses: VerseList,
};
export async function genVerseList({
    bibleKey, bookKey, chapter,
}: {
    bibleKey: string,
    bookKey: string,
    chapter: number,
}) {
    const verses = await getVerses(bibleKey, bookKey, chapter);
    if (verses === null) {
        return null;
    }
    const verseNumbList = await Promise.all(
        Array.from({ length: Object.keys(verses).length }, (_, i) => {
            return toLocaleNumBB(bibleKey, i + 1);
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
    event: any, bible: Bible, windowMode: WindowModEnum | null,
    index?: number,
) {
    const dirSource = await DirSource.getInstance(
        Bible.getSelectDirSettingName(windowMode),
    );
    dirSource.getFilePaths('bible').then((filePaths) => {
        const targetNames = (filePaths || []).map((filePath) => {
            return FileSource.getInstance(filePath).name;
        }).filter((name) => {
            const fileSource = FileSource.getInstance(bible.filePath);
            return name !== fileSource.name;
        });
        if (targetNames.length === 0) {
            showSimpleToast('Move Bible Item', 'No other bibles found');
            return;
        }
        showAppContextMenu(event, targetNames.map((name) => {
            return {
                title: name,
                onClick: async () => {
                    const bibleFileSource = FileSource.getInstance(
                        bible.filePath,
                    );
                    const { basePath, extension } = bibleFileSource;
                    const fileSource = FileSource.getInstance(
                        basePath, addExtension(name, extension),
                    );
                    const targetBible = await Bible.readFileToData(
                        fileSource.filePath,
                    );
                    if (!targetBible) {
                        showSimpleToast('Move Bible Item',
                            'Target bible not found');
                        return;
                    }
                    targetBible.moveItemFrom(bible.filePath, index);
                },
            };
        }));
    });
}
