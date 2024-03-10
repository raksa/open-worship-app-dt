import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from '../helper/errorHelpers';
import * as loggerHelpers from '../helper/loggerHelpers';
import BibleItem from '../bible-list/BibleItem';
import { BibleItemType } from '../bible-list/bibleItemHelpers';

export type SelectedBookKeyType = [string, string] | null;

export type APIDataType = {
    mapper: {
        [key: string]: {
            apiKey: string,
            apiUrl: string,
        }
    }
}

export type BibleSearchOnlineType = {
    maxLineNumber: number;
    fromLineNumber: number;
    toLineNumber: number;
    content: string[];
}
export type BibleSearchForType = {
    bookKey?: string,
    fromLineNumber?: number;
    toLineNumber?: number;
    text: string;
    isFresh?: boolean,
}


export type PagingDataTye = {
    pages: string[];
    currentPage: string;
    pageSize: number;
    perPage: number;
};
export type AllDataType = { [key: string]: BibleSearchOnlineType };

export function checkIsCurrentPage(
    data: BibleSearchOnlineType, pageNumber: number, perPage: number
) {
    const size = pageNumber * perPage;
    if (data.fromLineNumber <= size && size <= data.toLineNumber) {
        return true;
    }
}
export function findPageNumber(
    data: BibleSearchOnlineType, perPage: number, pages: string[],
) {
    for (const pageNumber of pages) {
        if (checkIsCurrentPage(data, +pageNumber, perPage)) {
            return pageNumber;
        }
    }
    return '0';
}

export function calcPerPage(data: BibleSearchOnlineType) {
    const perPage = data.toLineNumber - data.fromLineNumber + 1;
    return perPage;
}

export function calcPaging(data: BibleSearchOnlineType): PagingDataTye {
    const perPage = calcPerPage(data);
    const pageSize = Math.ceil(data.maxLineNumber / perPage);
    const pages = Array.from(Array(pageSize)).map((_, i) => {
        return (i + 1) + '';
    });
    const currentPage = findPageNumber(data, perPage, pages);
    return { pages, currentPage, pageSize, perPage };
}

export function breakItem(text: string, item: string, bibleKey: string) {
    const indexText = item.toLowerCase().indexOf(text.toLowerCase());
    const [bookKeyChapter, verse, ...newItems] = item.split(':');
    let newItem = newItems.join(':');
    if (indexText > 10) {
        newItem = item.substring(
            indexText - 10, indexText + 20
        );
        newItem = newItem.replace(
            new RegExp(`(${text})`, 'ig'),
            '<span style="color:red">$1</span>',
        );
    }
    const [bookKey, chapter] = bookKeyChapter.split('.');
    const target = {
        bookKey: bookKey, chapter: +chapter, verseStart: +verse,
        verseEnd: +verse,
    };
    const bibleItemJson: BibleItemType = {
        id: -1, metadata: {}, bibleKey, target,
    };
    const bibleItem = BibleItem.fromJson(bibleItemJson);
    const kjvTitle = `${bookKey} ${chapter}:${verse}`;
    return { newItem, bibleItem, kjvTitle };
}

export function pageNumberToReqData(
    pagingData: PagingDataTye, pageNumber: string,
) {
    const { perPage } = pagingData;
    let newPageNumber = +pageNumber;
    newPageNumber -= 1;
    const fromLineNumber = perPage * newPageNumber + 1;
    return {
        fromLineNumber,
        toLineNumber: fromLineNumber + perPage - 1,
    };
}

export async function searchOnline(
    apiUrl: string, apiKey: string, searchData: BibleSearchForType,
) {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(searchData),
        },
        );
        const result = await response.json();
        if (result['content']) {
            return result as BibleSearchOnlineType;
        }
        loggerHelpers.error(`Invalid bible search online ${result}`);
    } catch (error) {
        showSimpleToast(
            'Fetching Bible Search Online', 'Fail to fetch bible online',
        );
        handleError(error);
    }
    return null;
}
