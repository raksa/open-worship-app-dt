import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from '../helper/errorHelpers';
import * as loggerHelpers from '../helper/loggerHelpers';
import BibleItem from '../bible-list/BibleItem';
import { BibleItemType } from '../bible-list/bibleItemHelpers';

export type SelectedBookKeyType = {
    bookKey: string;
    book: string;
} | null;

export type APIDataMapType = {
    apiKey: string;
    apiUrl: string;
};
export type APIDataType = {
    mapper: {
        [key: string]: APIDataMapType | undefined;
    };
};

export type BibleLookupOnlineType = {
    maxLineNumber: number;
    fromLineNumber: number;
    toLineNumber: number;
    content: {
        text: string;
        uniqueKey: string;
    }[];
};
export type BibleLookupForType = {
    bookKey?: string;
    fromLineNumber?: number;
    toLineNumber?: number;
    text: string;
    isFresh?: boolean;
};

export type PagingDataTye = {
    pages: string[];
    currentPage: string;
    pageSize: number;
    perPage: number;
};
export type AllDataType = { [key: string]: BibleLookupOnlineType };

export function checkIsCurrentPage(
    data: BibleLookupOnlineType,
    pageNumber: number,
    perPage: number,
) {
    const size = pageNumber * perPage;
    if (data.fromLineNumber <= size && size <= data.toLineNumber) {
        return true;
    }
}
export function findPageNumber(
    data: BibleLookupOnlineType,
    perPage: number,
    pages: string[],
) {
    for (const pageNumber of pages) {
        if (checkIsCurrentPage(data, parseInt(pageNumber), perPage)) {
            return pageNumber;
        }
    }
    return '0';
}

export function calcPerPage(data: BibleLookupOnlineType) {
    const perPage = data.toLineNumber - data.fromLineNumber + 1;
    return perPage;
}

export function calcPaging(data: BibleLookupOnlineType | null): PagingDataTye {
    if (data === null) {
        return { pages: [], currentPage: '0', pageSize: 0, perPage: 0 };
    }
    const perPage = calcPerPage(data);
    const pageSize = Math.ceil(data.maxLineNumber / perPage);
    const pages = Array.from(Array(pageSize)).map((_, i) => {
        return i + 1 + '';
    });
    const currentPage = findPageNumber(data, perPage, pages);
    return { pages, currentPage, pageSize, perPage };
}

export function breakItem(text: string, item: string, bibleKey: string) {
    const indexText = item.toLowerCase().indexOf(text.toLowerCase());
    const [bookKeyChapter, verse, ...newItems] = item.split(':');
    let newItem = newItems.join(':');
    if (indexText > 10) {
        newItem = item.substring(indexText - 10, indexText + 20);
        newItem = newItem.replace(
            new RegExp(`(${text})`, 'ig'),
            '<span style="color:red">$1</span>',
        );
    }
    const [bookKey, chapter] = bookKeyChapter.split('.');
    const target = {
        bookKey: bookKey,
        chapter: parseInt(chapter),
        verseStart: parseInt(verse),
        verseEnd: parseInt(verse),
    };
    const bibleItemJson: BibleItemType = {
        id: -1,
        metadata: {},
        bibleKey,
        target,
    };
    const bibleItem = BibleItem.fromJson(bibleItemJson);
    const kjvTitle = `${bookKey} ${chapter}:${verse}`;
    return { newItem, bibleItem, kjvTitle };
}

export function pageNumberToReqData(
    pagingData: PagingDataTye,
    pageNumber: string,
) {
    const { perPage } = pagingData;
    let newPageNumber = parseInt(pageNumber);
    newPageNumber -= 1;
    const fromLineNumber = perPage * newPageNumber + 1;
    return {
        fromLineNumber,
        toLineNumber: fromLineNumber + perPage - 1,
    };
}

export async function lookupOnline(
    apiUrl: string,
    apiKey: string,
    lookupData: BibleLookupForType,
) {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(lookupData),
        });
        const result = await response.json();
        if (result['content']) {
            result.content = result.content.map((item: string) => {
                return {
                    text: item,
                    uniqueKey: crypto.randomUUID(),
                };
            });
            return result as BibleLookupOnlineType;
        }
        loggerHelpers.error(`Invalid bible lookup online ${result}`);
    } catch (error) {
        showSimpleToast(
            'Fetching Bible Lookup Online',
            'Fail to fetch bible online',
        );
        handleError(error);
    }
    return null;
}
