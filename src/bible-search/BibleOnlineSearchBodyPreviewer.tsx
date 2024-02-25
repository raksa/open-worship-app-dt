import { useState } from 'react';

import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from '../helper/errorHelpers';
import * as loggerHelpers from '../helper/loggerHelpers';
import BibleItem from '../bible-list/BibleItem';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import {
    SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';
import { useGetSelectedBibleKey } from '../bible-list/bibleHelpers';

type BibleSearchOnlineType = {
    maxLineNumber: number;
    fromLineNumber: number;
    toLineNumber: number;
    content: string[];
}
type BibleSearchForType = {
    fromLineNumber?: number;
    toLineNumber?: number;
    text: string;
}
type PagingDataTye = {
    pages: string[];
    currentPage: string;
    pageSize: number;
    perPage: number;
};
type AllDataType = { [key: string]: BibleSearchOnlineType };

function checkIsCurrentPage(
    data: BibleSearchOnlineType, pageNumber: number, perPage: number
) {
    const size = pageNumber * perPage;
    if (data.fromLineNumber <= size && size <= data.toLineNumber) {
        return true;
    }
}
function findPageNumber(
    data: BibleSearchOnlineType, perPage: number, pages: string[],
) {
    for (const pageNumber of pages) {
        if (checkIsCurrentPage(data, +pageNumber, perPage)) {
            return pageNumber;
        }
    }
    return '0';
}

function calcPerPage(data: BibleSearchOnlineType) {
    const perPage = data.toLineNumber - data.fromLineNumber + 1;
    return perPage;
}

function calcPaging(data: BibleSearchOnlineType): PagingDataTye {
    const perPage = calcPerPage(data);
    const pageSize = Math.ceil(data.maxLineNumber / perPage);
    const pages = Array.from(Array(pageSize)).map((_, i) => {
        return (i + 1) + '';
    });
    const currentPage = findPageNumber(data, perPage, pages);
    return { pages, currentPage, pageSize, perPage };
}

function breakItem(text: string, item: string) {
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
        id: -1, metadata: {}, bibleKey: 'KJV', target,
    };
    const bibleItem = BibleItem.fromJson(bibleItemJson);
    const kjvTitle = `${bookKey} ${chapter}:${verse}`;
    return { newItem, bibleItem, kjvTitle };
}

function pageNumberToReqData(pagingData: PagingDataTye, pageNumber: string) {
    const { perPage } = pagingData;
    let newPageNumber = +pageNumber;
    newPageNumber -= 1;
    const fromLineNumber = perPage * newPageNumber + 1;
    return {
        fromLineNumber,
        toLineNumber: fromLineNumber + perPage - 1,
    };
}

const rootUrl = 'https://b3xgqsu6u7.execute-api.us-west-2.amazonaws.com';
async function searchOnline(searchData: BibleSearchForType) {
    try {
        const response = await fetch(
            `${rootUrl}/prod/search-S0pW`,
            {
                headers: {
                    'x-api-key': 'InTheNameOfFatherSonAndHolySpirit',
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

export default function BibleOnlineSearchBodyPreviewer({
    bibleKey,
}: Readonly<{
    bibleKey: string,
}>) {
    const [inputText, setInputText] = useState('');
    const [searchingText, setSearchingText] = useState('');
    const [allData, setAllData] = useState<AllDataType>({});
    const searchOnline1 = (searchData: BibleSearchForType) => {
        searchOnline(searchData).then((data) => {
            if (data !== null) {
                const { perPage, pages } = calcPaging(data);
                const pageNumber = findPageNumber(data, perPage, pages);
                const newAllData = { ...allData, [pageNumber]: data };
                delete newAllData['0'];
                setAllData(newAllData);
            }
        });
    };
    return (
        <div className='card overflow-hidden w-100 h-100'>
            <div className='card-header input-group overflow-hidden' style={{
                height: 45,
            }}>
                <span className='input-group-text'>{bibleKey}</span>
                <input type='text'
                    className='form-control'
                    value={inputText}
                    onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            event.stopPropagation();
                            console.log('search');
                        }
                    }}
                    onChange={(event) => {
                        const value = event.target.value;
                        setInputText(value);
                    }} />
                <button className='btn btn-sm'
                    onClick={() => {
                        if (!inputText) {
                            return;
                        }
                        setSearchingText(inputText);
                        setAllData({});
                        searchOnline1({ text: inputText });
                    }}>
                    <i className='bi bi-search' />
                </button>
            </div>
            <RenderData
                text={searchingText} allData={allData}
                searchFor={(from: number, to: number) => {
                    searchOnline1({
                        fromLineNumber: from,
                        toLineNumber: to,
                        text: searchingText,
                    });
                }}
            />
        </div>
    );
}

function RenderData({
    text, allData, searchFor,
}: Readonly<{
    text: string,
    allData: { [key: string]: BibleSearchOnlineType },
    searchFor: (from: number, to: number) => void,
}>) {
    const [selectedBibleKey, _] = useGetSelectedBibleKey();
    const allPageNumberFound = Object.keys(allData);
    if (allPageNumberFound.length === 0) {
        return (
            <div>No Data</div>
        );
    }
    const pagingData = calcPaging(allData[allPageNumberFound[0]]);
    const searchFor1 = (pageNumber: string) => {
        const searchForData = pageNumberToReqData(pagingData, pageNumber);
        searchFor(searchForData.fromLineNumber, searchForData.toLineNumber);
    };
    const { pages } = pagingData;
    return (
        <>
            <div className='card-body w-100'>
                <h4>{text}</h4>
                {allPageNumberFound.map((pageNumber) => {
                    if (!pages.includes(pageNumber)) {
                        return null;
                    }
                    const data = allData[pageNumber];
                    return (
                        <RenderPerPage key={pageNumber}
                            text={text}
                            data={data} pageNumber={pageNumber}
                            selectedBibleKey={selectedBibleKey}
                        />
                    );
                })}
            </div>
            <div className='card-footer'>
                <nav>
                    <ul className='pagination flex-wrap'>
                        {pages.map((pageNumber) => {
                            const isActive = allPageNumberFound.includes(
                                pageNumber,
                            );
                            return (
                                <li key={pageNumber}
                                    className={
                                        `page-item ${isActive ? 'active' : ''}`
                                    }>
                                    <button className='page-link'
                                        disabled={isActive}
                                        onClick={() => {
                                            searchFor1(pageNumber);
                                        }}>
                                        {pageNumber}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
}

function syncEditingBibleItem(bibleItem: BibleItem) {
    const bibleItemViewController = SearchBibleItemViewController.getInstance();
    const newBibleItem = bibleItem.clone();
    newBibleItem.toTitle().then((title) => {
        bibleItemViewController.setInputText(title);
    });
}

function RenderPerPage({
    pageNumber, data, text, selectedBibleKey,
}: Readonly<{
    pageNumber: string,
    data: BibleSearchOnlineType,
    text: string,
    selectedBibleKey: string | null,
}>) {
    return (
        <>
            <div className='d-flex'>
                <span>{pageNumber}</span><hr className='w-100' />
            </div>
            <div className='w-100'>
                {data.content.map((item) => {
                    const {
                        newItem, kjvTitle, bibleItem,
                    } = breakItem(text, item);
                    if (selectedBibleKey !== null) {
                        bibleItem.bibleKey = selectedBibleKey;
                    }
                    return (
                        <button
                            className={
                                'btn btn-sm btn-outline-info ' +
                                'app-ellipsis w-100 overflow-hidden-x'
                            }
                            onClick={() => {
                                syncEditingBibleItem(bibleItem);
                            }}
                            title={item}
                            style={{ textAlign: 'left' }}
                            key={item.substring(10)}>
                            <span>{kjvTitle}</span> ... <span
                                dangerouslySetInnerHTML={{
                                    __html: newItem,
                                }} />
                        </button>
                    );
                })}
            </div>
        </>
    );
}
