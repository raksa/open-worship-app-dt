import { useState } from 'react';
import {
    getSetting, setSetting,
} from '../settingHelper';
import BibleItem from '../../bible-list/BibleItem';
import {
    getBookKVList, bookToKey, VerseList, getVerses,
} from './bibleInfoHelpers';
import {
    extractBible, toInputText,
} from './serverBibleHelpers2';
import {
    getDownloadedBibleInfoList,
} from './bibleDownloadHelpers';
import Bible from '../../bible-list/Bible';
import { showSimpleToast } from '../../toast/toastHelpers';
import CanvasController from '../../slide-editor/canvas/CanvasController';
import { useAppEffect } from '../debuggerHelpers';
import DirSource from '../DirSource';
import FileSource from '../FileSource';
import { showAppContextMenu } from '../../others/AppContextMenu';
import { addExtension } from '../../server/fileHelper';
import {
    WindowModEnum, checkIsWindowEditingMode,
} from '../../router/routeHelpers';
import { u } from 'tar';

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
        setSetting('selected-bible', bibleKey);
    }
    return bibleKey;
}
export function useGetSelectedBibleKey() {
    const [bibleKeySelected, _setBibleKeySelected] = useState<string | null>(
        null);
    const setBibleKeySelected = (bibleKey: string | null) => {
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleKey || '');
        _setBibleKeySelected(bibleKey);
    };
    useAppEffect(() => {
        getSelectedEditingBibleItem().then((bibleKey) => {
            setBibleKeySelected(bibleKey);
        });
    });
    return [bibleKeySelected, setBibleKeySelected] as
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

export async function genInputText(preBible: string,
    bibleKey: string, inputText: string) {
    const result = await extractBible(preBible, inputText);
    const {
        book: newBook,
        chapter: newChapter,
        startVerse: newStartVerse,
        endVerse: newEndVerse,
    } = result;
    if (newBook !== null) {
        const bookObj = await getBookKVList(preBible);
        const key = bookObj === null ? null : Object.keys(bookObj)
            .find((k) => {
                return bookObj[k] === newBook;
            });
        if (key) {
            const newBookObj = await getBookKVList(bibleKey);
            if (newBookObj !== null) {
                return toInputText(bibleKey, newBookObj[key],
                    newChapter, newStartVerse, newEndVerse);
            }
        }
    }
    return '';
}

export type AddBiblePropsType = {
    found: ConsumeVerseType,
    book: string,
    chapter: number,
    bibleSelected: string,
};

export async function bibleItemFromProp({
    found, book, chapter, bibleSelected,
}: AddBiblePropsType) {
    const key = await bookToKey(bibleSelected, book);
    if (key === null) {
        return null;
    }
    const bibleItem = BibleItem.fromJson({
        id: -1,
        bibleKey: bibleSelected,
        target: {
            book: key,
            chapter,
            startVerse: found.sVerse,
            endVerse: found.eVerse,
        },
        metadata: {},
    });
    return bibleItem;
};

export async function updateBibleItem(props: AddBiblePropsType, data: string) {
    const messageTitle = 'Saving Bible Item Failed';
    const newBibleItem = await bibleItemFromProp(props);
    if (newBibleItem === null) {
        showSimpleToast(messageTitle, 'Fail to recreate bible item');
        return null;
    }
    const oldBibleItem = BibleItem.parseBibleSearchData(data);
    if (oldBibleItem === null || oldBibleItem.filePath === undefined) {
        showSimpleToast(messageTitle, 'Invalid bible item data');
        return null;
    }
    const bible = await Bible.readFileToData(oldBibleItem.filePath);
    if (!bible) {
        showSimpleToast(messageTitle, 'Fail to read bible file');
        return null;
    }
    BibleItem.saveFromBibleSearch(bible, oldBibleItem, newBibleItem);
    return newBibleItem;
};

export async function addBibleItem(
    props: AddBiblePropsType, windowMode: WindowModEnum | null,
) {
    const isWindowEditing = checkIsWindowEditingMode();
    const bibleItem = await bibleItemFromProp(props);
    if (bibleItem === null) {
        showSimpleToast('Creating Bible Item', 'Fail to create bible item');
        return null;
    }
    if (isWindowEditing) {
        const canvasController = CanvasController.getInstance();
        canvasController.addNewBibleItem(bibleItem);
        return null;
    }
    const savedBibleItem = await Bible.updateOrToDefault(bibleItem, windowMode);
    if (savedBibleItem !== null) {
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
export async function consumeStartVerseEndVerse(
    book: string,
    chapter: number,
    startVerse: number | null,
    endVerse: number | null,
    bibleSelected: string,
) {
    const bookKey = await bookToKey(bibleSelected, book);
    if (bookKey === null) {
        return null;
    }
    const verses = await getVerses(bibleSelected, bookKey, chapter);
    if (verses === null) {
        return null;
    }
    const verseCount = Object.keys(verses).length;
    const sVerse = startVerse || 1;
    const eVerse = endVerse || verseCount;
    const result: ConsumeVerseType = {
        verses,
        sVerse,
        eVerse,
    };
    return result;
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
