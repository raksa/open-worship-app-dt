import { showSimpleToast } from '../../toast/toastHelpers';
import { handleError } from '../../helper/errorHelpers';
import appProvider from '../../server/appProvider';
import { writeStreamToFile } from '../../helper/bible-helpers/downloadHelpers';
import { getUserWritablePath } from '../../server/appHelpers';
import { fsDeleteFile, fsReadFile } from '../../server/fileHelpers';

/**
* <?xml version="1.0" encoding="UTF-8"?>
* <bible translation="Status in target language" status="Status in English">
*     <book number="1">
*         <chapter number="1">
*             <verse number="1">This is verse text</verse>
*         </chapter>
*     </book>
* </bible>
* to json
* {
*     "translation": "Status in target language",
*     "status": "Status in English",
*     "books": {
*         "1": {
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
export type BibleJsonType = {
    translation: string;
    status: string;
    books: { [bookNumber: string]: BibleBookJsonType };
};

export function xmlToJson(xmlText: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const bible = xmlDoc.getElementsByTagName('bible')[0];
    const json: BibleJsonType = {
        translation: bible.getAttribute('translation') || '',
        status: bible.getAttribute('status') || '',
        books: {},
    };
    const books = xmlDoc.getElementsByTagName('book');
    for (const book of books) {
        const bookNumber = book.getAttribute('number');
        if (bookNumber === null) {
            continue;
        }
        const bookJson: BibleBookJsonType = json.books[bookNumber] = {};
        const chapters = book.getElementsByTagName('chapter');
        for (const chapter of chapters) {
            const chapterNumber = chapter.getAttribute('number');
            if (chapterNumber === null) {
                continue;
            }
            const verseJson: BibleVerseType = bookJson[chapterNumber] = {};
            const verses = chapter.getElementsByTagName('verse');
            for (const verse of verses) {
                const verseNumber = verse.getAttribute('number');
                if (verseNumber === null || verse.textContent === null) {
                    continue;
                }
                verseJson[verseNumber] = verse.textContent;
            }
        }
    }
    return json;
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
