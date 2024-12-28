import { useState, useTransition } from 'react';

import { showSimpleToast } from '../../toast/toastHelpers';
import { handleError } from '../../helper/errorHelpers';
import LoadingComp from '../../others/LoadingComp';
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
type BibleVerseType = {
    [verseNumber: string]: string;
};
type BibleBookJsonType = {
    [chapterNumber: string]: BibleVerseType;
};
type BibleJsonType = {
    translation: string;
    status: string;
    books: { [bookNumber: string]: BibleBookJsonType };
};
function xmlToJson(xmlText: string) {
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
function getInputByName(form: HTMLFormElement, name: string) {
    const inputFile = form.querySelector(`input[name="${name}"]`);
    if (inputFile === null || !(inputFile instanceof HTMLInputElement)) {
        return null;
    }
    return inputFile;
}
function readFromFile(form: HTMLFormElement) {
    return new Promise<string | null>((resolve, reject) => {
        const inputFile = getInputByName(form, 'file');
        if (inputFile === null || !(inputFile instanceof HTMLInputElement)) {
            resolve(null);
        }
        const file = (inputFile as any).files?.[0];
        if (!file) {
            resolve(null);
        }
        const reader = new FileReader();
        reader.onload = function (event1) {
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
            resolve(response);
        });
        request.on('error', (event: Error) => {
            reject(event);
        });
        request.end();
    });
}
function downloadXMLToFile(filePath: string, response: any) {
    return new Promise<void>((resolve, reject) => {
        writeStreamToFile(filePath, {
            onStart: (total) => {
                const fileSize = parseInt(total.toFixed(2));
                showSimpleToast(
                    'Download Started',
                    `Total: ${fileSize}MB`,
                );
            },
            onProgress: (_) => { },
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
async function readFromUrl(form: HTMLFormElement) {
    const inputText = getInputByName(form, 'url');
    if (inputText === null || !inputText.value) {
        return null;
    }
    const url = new URL(inputText.value);
    try {
        const response = await initHttpRequest(url);
        const userWritablePath = getUserWritablePath();
        const fileFullName = appProvider.pathUtils.basename(url.pathname);
        if (fileFullName.endsWith('.xml') === false) {
            showSimpleToast(
                'Invalid File',
                'Require url to xml file name. ' +
                'e.g. "https://example.com/file.xml"',
            );
            return null;
        }
        const filePath = appProvider.pathUtils.resolve(
            userWritablePath, 'temp-xml', fileFullName,
        );
        await downloadXMLToFile(filePath, response);
        const xmlText = await fsReadFile(filePath);
        await fsDeleteFile(filePath);
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

export default function SettingBibleXMLComp() {
    const [outputJson, setOutputJson] = useState<BibleJsonType | null>(null);
    const [isPending, startTransition] = useTransition();
    const handleFormSubmitting = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        startTransition(async () => {
            try {
                const form = event.currentTarget;
                if (!(form instanceof HTMLFormElement)) {
                    return;
                }
                const data = await readFromFile(form);
                const dataText = data || await readFromUrl(form);
                if (dataText === null) {
                    showSimpleToast(
                        'No Data',
                        'No data to process',
                    );
                    return;
                }
                const json = xmlToJson(dataText);
                setOutputJson(json);
            } catch (error) {
                showSimpleToast(
                    'Format Submit Error',
                    `Error: ${error}`,
                );
            }
        });
    };
    return (
        <div className='w-100'>
            <h3>From XML</h3>
            <form onSubmit={handleFormSubmitting}>
                <div className='app-border-white-round p-2'>
                    <div>
                        <input className='form-control' type='file' name='file'
                        />
                    </div>
                    <span>or</span>
                    <div>
                        <label className='form-label' htmlFor='url'>URL:</label>
                        <input className='form-control' id='url' type='text'
                            name='url'
                        />
                    </div>
                </div>
                <div>
                    <input className='form-control' type='submit' value='Submit'
                    />
                </div>
                <div className='app-border-white-round'>
                    {isPending ? (
                        <LoadingComp />
                    ) : null}
                    {outputJson ? (
                        <pre>{JSON.stringify(outputJson, null, 2)}</pre>
                    ) : null}
                </div>
            </form>
        </div>
    );
}
