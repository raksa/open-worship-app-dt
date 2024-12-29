import { showSimpleToast } from '../../toast/toastHelpers';
import { handleError } from '../../helper/errorHelpers';
import appProvider from '../../server/appProvider';
import { writeStreamToFile } from '../../helper/bible-helpers/downloadHelpers';
import { getUserWritablePath } from '../../server/appHelpers';
import { fsDeleteFile, fsReadFile } from '../../server/fileHelpers';

import kjvBibleInfo from '../../helper/bible-helpers/bible.json';
import { getLocaleCode } from '../../lang';

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
    element: Element, keys: string[], defaultValue: string | null = null,
) {
    for (const key of keys) {
        const value = element.getAttribute(key);
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
        const key = guessValue(bookKeyMapElement, ['key']);
        const value = guessValue(bookKeyMapElement, ['value']);
        if (key === null || value === null) {
            continue;
        }
        bookKeyMap[key] = value;
    }
    return bookKeyMap;
}

function getBibleInfoJson(bible: Element): BibleJsonInfoType | null {
    const mapElement = guessElement(bible, ['map'])?.[0];
    const numberKeyMap = getBibleMap(mapElement || null, 'number',
        Object.fromEntries(Array.from(
            { length: 10 }, (_, i) => [i.toString(), i.toString()],
        ))
    );
    const bookKeyMap = getBibleMap(
        mapElement || null, 'book', kjvBibleInfo.kjvKeyValue,
    );
    const locale = guessValue(bible, ['locale']) || 'en';
    if (getLocaleCode(locale) === null) {
        return null;
    }
    return {
        title: (
            guessValue(
                bible, ['title', 'name', 'translation'],
            ) || 'Unknown Title'
        ),
        key: guessValue(bible, ['key', 'abbr']) || 'Unknown Key',
        version: parseInt(guessValue(bible, ['version']) || '1') || 1,
        locale,
        legalNote: (
            guessValue(bible, ['legalNote', 'status']) || 'Unknown Legal Note'
        ),
        publisher: guessValue(bible, ['publisher']) || 'Unknown Publisher',
        copyRights: (
            guessValue(bible, ['copyRights']) || 'Unknown Copy Rights'
        ),
        numbersMap: numberKeyMap,
        booksMap: bookKeyMap,
    };
}

function getBibleVerses(chapter: Element): BibleVerseType {
    const verseJson: BibleVerseType = {};
    const verses = Array.from(guessElement(chapter, ['verse']) || []);
    for (const verse of verses) {
        const verseNumber = guessValue(verse, INDEX_ATTRIBUTES, null);
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
        const chapterNumber = guessValue(chapter, INDEX_ATTRIBUTES, null);
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
        const bookNumberText = guessValue(book, INDEX_ATTRIBUTES, null);
        if (bookNumberText === null) {
            continue;
        }
        const bookNumber = parseInt(bookNumberText);
        if (isNaN(bookNumber)) {
            continue;
        }
        const bookKey = bookKeysOrder[bookNumber - 1];
        if (bookKey === undefined) {
            continue;
        }
        booksJson[bookKey] = getBibleChapters(book);
    }
    return booksJson;
}

const INDEX_ATTRIBUTES = ['number', 'index', 'id'];
export function xmlToJson(xmlText: string): BibleJsonType | null {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const bible = guessElement(xmlDoc, ['bible'])?.[0];
    if (!bible) {
        return null;
    }
    const bibleInfo = getBibleInfoJson(bible);
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
    return { info: bibleInfo, books: bibleBooks };
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
            resolve(event1.target?.result?.toString() || null);
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
    if (inputText === null || !inputText.value) {
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

export const xmlFormatExample = `<?xml version="1.0" encoding="UTF-8"?>
<bible
    title="Example Bible Translation Version"
    // [name] optional alternative to title
    name="Example Bible Translation Version"
    // [translation] optional alternative to title
    translation="Example Bible Translation Version"
    // "key" is important for identifying ever bible
    //  the application will popup input key if it is not found
    key="EBTV"
    // [abbr] optional alternative to key
    abbr="EBTV"
    version="1"
    // e.g: for Khmer(km) locale="km"
    locale="en"
    legalNote="Example of legal note"
    // [status] optional alternative to legalNote
    status="Example of legal note"
    publisher="Example of publisher"
    copyRights="Example copy rights">
    <map>
        // e.g: for Khmer(km) value="លោកុ‌ប្បត្តិ" for value="GEN"
        <book key="GEN" value="GENESIS"/>
        <book key="EXO" value="EXODUS"/>
        <book key="LEV" value="LEVITICUS"/>
        <book key="NUM" value="NUMBERS"/>
        <book key="DEU" value="DEUTERONOMY"/>
        <book key="JOS" value="JOSHUA"/>
        <book key="JDG" value="JUDGES"/>
        <book key="RUT" value="RUTH"/>
        <book key="1SA" value="1 SAMUEL"/>
        <book key="2SA" value="2 SAMUEL"/>
        <book key="1KI" value="1 KINGS"/>
        <book key="2KI" value="2 KINGS"/>
        <book key="1CH" value="1 CHRONICLES"/>
        <book key="2CH" value="2 CHRONICLES"/>
        <book key="EZR" value="EZRA"/>
        <book key="NEH" value="NEHEMIAH"/>
        <book key="EST" value="ESTHER"/>
        <book key="JOB" value="JOB"/>
        <book key="PSA" value="PSALM"/>
        <book key="PRO" value="PROVERBS"/>
        <book key="ECC" value="ECCLESIASTES"/>
        <book key="SNG" value="SONG OF SOLOMON"/>
        <book key="ISA" value="ISAIAH"/>
        <book key="JER" value="JEREMIAH"/>
        <book key="LAM" value="LAMENTATIONS"/>
        <book key="EZK" value="EZEKIEL"/>
        <book key="DAN" value="DANIEL"/>
        <book key="HOS" value="HOSEA"/>
        <book key="JOL" value="JOEL"/>
        <book key="AMO" value="AMOS"/>
        <book key="OBA" value="OBADIAH"/>
        <book key="JON" value="JONAH"/>
        <book key="MIC" value="MICAH"/>
        <book key="NAM" value="NAHUM"/>
        <book key="HAB" value="HABAKKUK"/>
        <book key="ZEP" value="ZEPHANIAH"/>
        <book key="HAG" value="HAGGAI"/>
        <book key="ZEC" value="ZECHARIAH"/>
        <book key="MAL" value="MALACHI"/>
        <book key="MAT" value="MATTHEW"/>
        <book key="MRK" value="MARK"/>
        <book key="LUK" value="LUKE"/>
        <book key="JHN" value="JOHN"/>
        <book key="ACT" value="ACTS"/>
        <book key="ROM" value="ROMANS"/>
        <book key="1CO" value="1 CORINTHIANS"/>
        <book key="2CO" value="2 CORINTHIANS"/>
        <book key="GAL" value="GALATIANS"/>
        <book key="EPH" value="EPHESIANS"/>
        <book key="PHP" value="PHILIPPIANS"/>
        <book key="COL" value="COLOSSIANS"/>
        <book key="1TH" value="1 THESSALONIANS"/>
        <book key="2TH" value="2 THESSALONIANS"/>
        <book key="1TI" value="1 TIMOTHY"/>
        <book key="2TI" value="2 TIMOTHY"/>
        <book key="TIT" value="TITUS"/>
        <book key="PHM" value="PHILEMON"/>
        <book key="HEB" value="HEBREWS"/>
        <book key="JAS" value="JAMES"/>
        <book key="1PE" value="1 PETER"/>
        <book key="2PE" value="2 PETER"/>
        <book key="1JN" value="1 JOHN"/>
        <book key="2JN" value="2 JOHN"/>
        <book key="3JN" value="3 JOHN"/>
        <book key="JUD" value="JUDE"/>
        <book key="REV" value="REVELATION"/>
        // e.g: for Khmer(km) value="១" for value="1"
        <number key="0" value="0"/>
        <number value="0" value="1"/>
        <number key="2" value="2"/>
        <number key="3" value="3"/>
        <number key="4" value="4"/>
        <number key="5" value="5"/>
        <number key="6" value="6"/>
        <number key="7" value="7"/>
        <number key="8" value="8"/>
        <number key="9" value="9"/>
    </map>
    <testament name="Old">
        <book number="1">
            <chapter number="1">
                // eslint-disable-next-line max-len
                <verse number="1">
                    This is verse text of chapter 1 in book 1
                </verse>
            </chapter>
        </book>
    </testament>
    <testament name="New">
        <book number="40">
            <chapter number="2">
                <verse number="1">
                    This is verse text of chapter 2 in book 40
                </verse>
            </chapter>
        </book>
    </testament>
    <book number="3">
        <chapter number="3">
            <verse number="1">This is verse text of chapter 3 in book 3</verse>
        </chapter>
    </book>
</bible>`;
