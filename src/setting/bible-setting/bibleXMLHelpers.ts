import { showSimpleToast } from '../../toast/toastHelpers';
import { handleError } from '../../helper/errorHelpers';
import appProvider from '../../server/appProvider';
import { writeStreamToFile } from '../../helper/bible-helpers/downloadHelpers';
import { getUserWritablePath, showExplorer } from '../../server/appHelpers';
import {
    fsDeleteFile, fsListFiles, fsReadFile, fsWriteFile,
} from '../../server/fileHelpers';
import kjvBibleInfo from '../../helper/bible-helpers/bible.json';
import { allLocalesMap, DEFAULT_LOCALE, getLangCode } from '../../lang';
import {
    showAppConfirm, showAppInput,
} from '../../popup-widget/popupWidgetHelpers';
import {
    genBibleBooksMapXMLInput, genBibleKeyXMLInput, genBibleNumbersMapXMLInput,
} from './bibleXMLAttributesGuessing';
import { bibleDataReader } from '../../helper/bible-helpers/bibleInfoHelpers';
import {
    getDownloadedBibleInfoList,
} from '../../helper/bible-helpers/bibleDownloadHelpers';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenuComp';
import { useState, useTransition } from 'react';
import { useAppEffect } from '../../helper/debuggerHelpers';

/**
* {
*     "info": {
*         "title": "Title of bible. e.g: King James Version",
*         "key": "Bible key. e.g: KJV",
*         "version": <version of data. e.g: 1>,
*         "locale": "Language of bible. e.g: en",
*         "legalNote": "Legal note of bible. e.g: Public Domain",
*         "publisher": "Publisher of bible. e.g: Bible Society",
*         "copyRights": "Copy rights of bible. e.g: Public Domain",
*         "books": {
*             "GEN": "GENESIS",
*         }
*     }
*     "books": {
*         "GEN": {
*             "1": "In the beginning God created the heavens and the earth."
*         }
*     }
* }
*/
type MessageCallbackType = (message: string | null) => void;
export type BibleVerseType = {
    [verseNumber: string]: string;
};
export type BibleBookJsonType = {
    [chapterNumber: string]: BibleVerseType;
};
export type BibleJsonInfoType = {
    title: string,
    key: string,
    version: number,
    locale: string,
    legalNote: string,
    publisher: string,
    copyRights: string,
    numbersMap: { [key: string]: string },
    booksMap: { [booKey: string]: string },
};
export type BibleJsonType = {
    info: BibleJsonInfoType,
    books: { [booKey: string]: BibleBookJsonType },
};

function guessValue(
    element: Element, bibleKeys: string[], defaultValue: string | null = null,
) {
    for (const bibleKey of bibleKeys) {
        const value = element.getAttribute(bibleKey);
        if (value !== null) {
            return value;
        }
    }
    return defaultValue;
}
function guessElement(element: Element | Document, tags: string[]) {
    for (const tag of tags) {
        const child = element.getElementsByTagName(tag);
        if (child !== null) {
            return child;
        }
    }
    return null;
}

function getBibleMap(
    mapElement: Element | null, tag: string,
    defaultMap: { [key: string]: string },
) {
    const bookKeyMap: { [key: string]: string } = defaultMap;
    const bookKeyMapElements = mapElement === null ? [] : Array.from(
        guessElement(mapElement, [tag]) || [],
    );
    for (const bookKeyMapElement of bookKeyMapElements) {
        const bibleKey = guessValue(bookKeyMapElement, ['key']);
        const value = guessValue(bookKeyMapElement, ['value']);
        if (bibleKey === null || value === null) {
            continue;
        }
        bookKeyMap[bibleKey] = value;
    }
    return bookKeyMap;
}

function toGuessingBibleKeys(value: string) {
    return value.split(/[\.,\s]/).map((value1) => {
        return value1.trim();
    }).filter((value1) => {
        return value1;
    });
}
function getGuessingBibleKeys(bible: Element) {
    const guessingKeys: string[] = [];
    for (const attribute of Array.from(bible.attributes)) {
        const value = attribute.nodeValue;
        if (value) {
            guessingKeys.push(...toGuessingBibleKeys(value));
        }
    }
    return Array.from(new Set(guessingKeys));
}

async function getBibleInfoJson(bible: Element) {
    const mapElement = guessElement(bible, ['map'])?.[0];
    const numberKeyMap = getBibleMap(mapElement || null, 'number',
        Object.fromEntries(Array.from(
            { length: 10 }, (_, i) => [i.toString(), i.toString()],
        ))
    );
    const bookKeyMap = getBibleMap(
        mapElement || null, 'book', kjvBibleInfo.kjvKeyValue,
    );
    let bibleKey = guessValue(bible, ['key', 'abbr']);
    const downloadedBibleInfoList = await getDownloadedBibleInfoList();
    if (downloadedBibleInfoList === null) {
        return null;
    }
    while (bibleKey === null) {
        let newKey = '';
        const isConfirmInput = await showAppInput(
            'Key is missing',
            genBibleKeyXMLInput(newKey, (newKey1) => {
                newKey = newKey1;
            }, downloadedBibleInfoList, getGuessingBibleKeys(bible)),
        );
        if (isConfirmInput) {
            bibleKey = newKey;
        }
        const isConfirm = await showAppConfirm(
            'Confirm Key Value',
            bibleKey ? `Do you want to continue with key="${bibleKey}"?` :
                'Are you sure you want to quite?',
        );
        if (isConfirm) {
            break;
        } else {
            bibleKey = null;
        }
    }
    if (bibleKey === null) {
        return null;
    }
    const locale = guessValue(bible, ['locale']) ?? DEFAULT_LOCALE;
    if (getLangCode(locale) === null) {
        return null;
    }
    return {
        title: (
            guessValue(
                bible, ['title', 'name', 'translation'],
            ) ?? 'Unknown Title'
        ),
        key: bibleKey,
        version: parseInt(guessValue(bible, ['version']) ?? '1') ?? 1,
        locale,
        legalNote: (
            guessValue(bible, ['legalNote', 'status']) ?? 'Unknown Legal Note'
        ),
        publisher: guessValue(bible, ['publisher']) ?? 'Unknown Publisher',
        copyRights: (
            guessValue(bible, ['copyRights']) ?? 'Unknown Copy Rights'
        ),
        numbersMap: numberKeyMap,
        booksMap: bookKeyMap,
    } as BibleJsonInfoType;
}

function getBibleVerses(chapter: Element): BibleVerseType {
    const verseJson: BibleVerseType = {};
    const verses = Array.from(guessElement(chapter, ['verse']) || []);
    for (const verse of verses) {
        const verseNumber = guessValue(verse, BOOK_INDEX_ATTRIBUTES, null);
        if (verseNumber === null || verse.textContent === null) {
            continue;
        }
        verseJson[verseNumber] = verse.textContent;
    }
    return verseJson;
}

function getBibleChapters(book: Element): BibleBookJsonType {
    const bookJson: BibleBookJsonType = {};
    const chapters = Array.from(guessElement(book, ['chapter']) || []);
    for (const chapter of chapters) {
        const chapterNumber = guessValue(chapter, BOOK_INDEX_ATTRIBUTES, null);
        if (chapterNumber === null) {
            continue;
        }
        bookJson[chapterNumber] = getBibleVerses(chapter);
    }
    return bookJson;
}

function getBibleBooksJson(books: Element[]) {
    const booksJson: { [booKey: string]: BibleBookJsonType } = {};
    const bookKeysOrder = kjvBibleInfo.booksOrder;
    for (const book of books) {
        let bookKey = guessValue(book, BOOK_KEY_ATTRIBUTES, null);
        if (bookKey !== null && bookKeysOrder.includes(bookKey)) {
            booksJson[bookKey] = getBibleChapters(book);
            continue;
        }
        const bookNumberText = guessValue(book, BOOK_INDEX_ATTRIBUTES, null);
        if (bookNumberText === null) {
            continue;
        }
        const bookIndex = parseInt(bookNumberText);
        if (isNaN(bookIndex)) {
            continue;
        }
        bookKey = bookKeysOrder[bookIndex - 1];
        if (bookKey === undefined) {
            continue;
        }
        booksJson[bookKey] = getBibleChapters(book);
    }
    return booksJson;
}

export function jsonToXMLText(jsonData: BibleJsonType) {
    const { numbersMap, booksMap, ...info } = jsonData.info;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(
        '<?xml version="1.0" encoding="UTF-8"?><bible></bible>',
        'application/xml'
    );

    const bible = xmlDoc.getElementsByTagName('bible')[0];
    for (const [key, value] of Object.entries(info)) {
        bible.setAttribute(key, value.toString());
    }
    const map = xmlDoc.createElement('map');
    for (const [key, value] of Object.entries(numbersMap)) {
        const number = xmlDoc.createElement('number');
        number.setAttribute('key', key);
        number.setAttribute('value', value);
        map.appendChild(number);
    }
    for (const [key, value] of Object.entries(booksMap)) {
        const book = xmlDoc.createElement('book');
        book.setAttribute('key', key);
        book.setAttribute('value', value);
        map.appendChild(book);
    }
    bible.appendChild(map);
    const books = jsonData.books;
    for (const [bookKey, book] of Object.entries(books)) {
        const bookElement = xmlDoc.createElement('book');
        const bookIndex = kjvBibleInfo.booksOrder.indexOf(bookKey);
        if (bookIndex === -1) {
            continue;
        }
        bookElement.setAttribute('key', (bookIndex + 1).toString());
        for (const [chapterKey, chapter] of Object.entries(book)) {
            const chapterElement = xmlDoc.createElement('chapter');
            chapterElement.setAttribute('number', chapterKey);
            for (const [verseKey, verse] of Object.entries(chapter)) {
                const verseElement = xmlDoc.createElement('verse');
                verseElement.setAttribute('number', verseKey);
                verseElement.textContent = verse;
                chapterElement.appendChild(verseElement);
            }
            bookElement.appendChild(chapterElement);
        }
        bible.appendChild(bookElement);
    }
    const serializer = new XMLSerializer();
    const xmlText = serializer.serializeToString(xmlDoc);
    return xmlText;
}

function xmlTextToBibleElement(xmlText: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const bible = guessElement(xmlDoc, ['bible'])?.[0];
    return bible;
}

const BOOK_KEY_ATTRIBUTES = ['key'];
const BOOK_INDEX_ATTRIBUTES = ['number', 'index', 'id'];
export async function xmlToJson(xmlText: string) {
    const bible = xmlTextToBibleElement(xmlText);
    if (!bible) {
        return null;
    }
    const bibleInfo = await getBibleInfoJson(bible);
    if (bibleInfo === null) {
        return null;
    }
    const books = Array.from(guessElement(bible, ['book']) || []);
    const testaments = guessElement(bible, ['testament']);
    if (testaments !== null) {
        for (const testament of testaments) {
            books.push(...Array.from(guessElement(testament, ['book']) || []));
        }
    }
    const bibleBooks = getBibleBooksJson(books);
    if (bibleBooks === null) {
        return null;
    }
    return { info: bibleInfo, books: bibleBooks } as BibleJsonType;
}

export function getInputByName(form: HTMLFormElement, name: string) {
    const inputFile = form.querySelector(`input[name="${name}"]`);
    if (inputFile === null || !(inputFile instanceof HTMLInputElement)) {
        return null;
    }
    return inputFile;
}

export function readFromFile(
    form: HTMLFormElement, messageCallback: MessageCallbackType,
) {
    return new Promise<string | null>((resolve, reject) => {
        const inputFile = getInputByName(form, 'file');
        if (inputFile === null || !(inputFile instanceof HTMLInputElement)) {
            resolve(null);
        }
        const file = (inputFile as any).files?.[0];
        if (!file) {
            resolve(null);
        }
        messageCallback('Reading file...');
        const reader = new FileReader();
        reader.onload = function (event1) {
            messageCallback(null);;
            resolve(event1.target?.result?.toString() ?? null);
        };
        reader.onerror = function (error) {
            handleError(error);
            reject(new Error('Error during reading file'));
        };
        reader.readAsText(file);
    });
}

function initHttpRequest(url: URL) {
    return new Promise<any>((resolve, reject) => {
        const request = appProvider.httpUtils.request({
            port: 443,
            path: url.pathname + url.search,
            method: 'GET',
            hostname: url.hostname,
        }, (response) => {
            if (response.statusCode === 302 && response.headers.location) {
                initHttpRequest(new URL(response.headers.location)).then(
                    resolve,
                );
                return;
            }
            resolve(response);
        });
        request.on('error', (event: Error) => {
            reject(event);
        });
        request.end();
    });
}

function downloadXMLToFile(
    filePath: string, response: any, messageCallback: MessageCallbackType
) {
    return new Promise<void>((resolve, reject) => {
        writeStreamToFile(filePath, {
            onStart: (total) => {
                const fileSize = parseInt(total.toFixed(2));
                messageCallback(
                    `Start downloading (File size: ${fileSize}MB)...`
                );
            },
            onProgress: (progress) => {
                messageCallback(
                    `${(progress * 100).toFixed(2)}% done`
                );
            },
            onDone: (error, filePath) => {
                if (error) {
                    showSimpleToast(
                        'Download Error',
                        `Error: ${error}`,
                    );
                    reject(error);
                    return;
                }
                showSimpleToast(
                    'Download Completed',
                    `File saved at: ${filePath}`,
                );
                resolve();
            },
        }, response);
    });
}

export async function readFromUrl(
    form: HTMLFormElement, messageCallback: MessageCallbackType,
) {
    const inputText = getInputByName(form, 'url');
    if (!inputText?.value) {
        return null;
    }
    const url = new URL(inputText.value);
    try {
        messageCallback('Downloading file...');
        const response = await initHttpRequest(url);
        const userWritablePath = getUserWritablePath();
        let fileFullName = appProvider.pathUtils.basename(url.pathname);
        if (fileFullName.endsWith('.xml') === false) {
            fileFullName += '.xml';
        }
        const filePath = appProvider.pathUtils.resolve(
            userWritablePath, 'temp-xml', fileFullName,
        );
        await downloadXMLToFile(filePath, response, messageCallback);
        messageCallback('Reading file...');
        const xmlText = await fsReadFile(filePath);
        messageCallback('Deleting file...');
        await fsDeleteFile(filePath);
        messageCallback(null);
        return xmlText;
    } catch (error) {
        showSimpleToast(
            `Error occurred during download "${inputText.value}"`,
            `Error: ${error}`,
        );
        handleError(error);
    }
    return null;
}

export function checkIsValidUrl(urlText: string) {
    try {
        new URL(urlText);
        return true;
    } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error
    ) {
        return false;
    }
}

export async function getBibleInfo(bibleKey: string) {
    const filePath = await bibleKeyToFilePath(bibleKey);
    const xmlText = await fsReadFile(filePath);
    const bible = xmlTextToBibleElement(xmlText);
    if (!bible) {
        return null;
    }
    return await getBibleInfoJson(bible);
}

export async function getAllXMLFileKeys() {
    const dirPath = await bibleDataReader.getWritableBiblePath();
    const files = await fsListFiles(dirPath);
    return Object.fromEntries(files.map((file) => {
        if (!file.endsWith('.xml')) {
            return null;
        }
        return appProvider.pathUtils.basename(file, '.xml');
    }).filter((bibleKey) => {
        return bibleKey !== null;
    }).map((bibleKey) => {
        const filePath = appProvider.pathUtils.resolve(
            dirPath, `${bibleKey}.xml`,
        );
        return [bibleKey, filePath] as [string, string];
    }));
}

export async function bibleKeyToFilePath(bibleKey: string) {
    const dirPath = await bibleDataReader.getWritableBiblePath();
    return appProvider.pathUtils.resolve(dirPath, `${bibleKey}.xml`);
}

export async function saveXMLText(bibleKey: string, xmlText: string) {
    const filePath = await bibleKeyToFilePath(bibleKey);
    await fsWriteFile(filePath, xmlText);
}

export function handBibleKeyContextMenuOpening(
    bibleKey: string, event: any,
) {
    const contextMenuItems: ContextMenuItemType[] = [{
        menuTitle: (
            `Reveal in ${appProvider.systemUtils.isMac ?
                'Finder' : 'File Explorer'}`
        ),
        onClick: async () => {
            const filePath = await bibleKeyToFilePath(bibleKey);
            showExplorer(filePath);
        },
    }];
    showAppContextMenu(event, contextMenuItems);
};

export function handBibleInfoContextMenuOpening(
    event: any, bibleInfo: BibleJsonInfoType,
    setBibleInfo: (bibleInfo: BibleJsonInfoType) => void,
) {
    const contextMenuItems: ContextMenuItemType[] = [{
        menuTitle: 'Chose Locale',
        onClick: () => {
            showAppContextMenu(event, Object.entries(allLocalesMap).map(
                ([locale]) => {
                    return {
                        menuTitle: locale,
                        onClick: () => {
                            setBibleInfo({
                                ...bibleInfo,
                                locale,
                            });
                        },
                    };
                }),
            );
        },
    }, {
        menuTitle: 'Edit Numbers Map',
        onClick: async () => {
            let numbers = Object.keys(bibleInfo.numbersMap);
            const isConfirmInput = await showAppInput(
                'Numbers map',
                genBibleNumbersMapXMLInput(numbers, bibleInfo.locale,
                    (newNumbers) => {
                        numbers = newNumbers;
                    },
                ),
            );
            if (isConfirmInput) {
                setBibleInfo({
                    ...bibleInfo,
                    numbersMap: Object.fromEntries(numbers.map(
                        (value, index) => [index.toString(), value],
                    )),
                });
            }
        },
    }, {
        menuTitle: 'Edit Books Map',
        onClick: async () => {
            let bookKeys = Object.values(bibleInfo.booksMap);
            const isConfirmInput = await showAppInput(
                'Books map',
                genBibleBooksMapXMLInput(
                    bookKeys, bibleInfo.locale, (newNumbers) => {
                        bookKeys = newNumbers;
                    },
                ),
            );
            if (isConfirmInput) {
                setBibleInfo({
                    ...bibleInfo,
                    booksMap: Object.fromEntries(
                        Object.keys(bibleInfo.booksMap).map(
                            (value, index) => [value, bookKeys[index]],
                        ),
                    ),
                });
            }
        },
    }, {
        menuTitle: 'Copy to Clipboard',
        onClick: () => {
            navigator.clipboard.writeText(
                JSON.stringify(bibleInfo, null, 2),
            );
            showSimpleToast('Copied', 'Bible info copied');
        },
    }];
    showAppContextMenu(event, contextMenuItems);
};

export async function updateBibleXMLInfo(
    bibleInfo: BibleJsonInfoType,
) {
    const filePath = await bibleKeyToFilePath(bibleInfo.key);
    const xmlText = await fsReadFile(filePath);
    const dataJson = await xmlToJson(xmlText);
    if (dataJson === null) {
        showSimpleToast('Error', 'Error occurred during reading file');
        return;
    }
    const jsonData = { ...dataJson, info: bibleInfo };
    saveXMLText(bibleInfo.key, jsonToXMLText(jsonData));
}

export function useBibleXMLInfo(bibleKey: string) {
    const [bibleInfo, setBibleInfo] = (
        useState<BibleJsonInfoType | null>(null)
    );
    const [isPending, startTransition] = useTransition();
    const loadBibleKeys = () => {
        startTransition(async () => {
            const newBibleInfo = await getBibleInfo(bibleKey);
            setBibleInfo(newBibleInfo);
        });
    };
    useAppEffect(loadBibleKeys, []);
    return { bibleInfo, isPending, setBibleInfo };
}

export function useBibleXMLKeys() {
    const [bibleKeysMap, setBibleKeysMap] = (
        useState<{ [key: string]: string } | null>(null)
    );
    const [isPending, startTransition] = useTransition();
    const loadBibleKeys = () => {
        startTransition(async () => {
            const keys = await getAllXMLFileKeys();
            setBibleKeysMap(keys);
        });
    };
    useAppEffect(loadBibleKeys, []);
    return { bibleKeysMap, isPending, loadBibleKeys };
}
