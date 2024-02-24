import { useState } from 'react';

import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from '../helper/errorHelpers';
import * as loggerHelpers from '../helper/loggerHelpers';

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
    pages: number[];
    currentPage: number;
    pageSize: number;
};
const testData: BibleSearchOnlineType = {
    maxLineNumber: 10,
    fromLineNumber: 0,
    toLineNumber: 3,
    content: [
        '1CO.15:15:this is test1.',
        '1CO.15:31:this is test2.',
        '1CO.2:1:this is test3.',
        '1JN.4:14:this is test4.',
    ],
};

function calcPaging(data: BibleSearchOnlineType | null): PagingDataTye | null {
    if (data === null) {
        return null;
    }
    const perPage = data.toLineNumber - data.fromLineNumber;
    const pageSize = Math.ceil(data.maxLineNumber / perPage);
    let currentPage = 0;
    const pages = Array.from(Array(pageSize)).map((_, i) => {
        i += 1;
        const size = i * perPage;
        if (data.fromLineNumber <= size || size <= data.toLineNumber) {
            currentPage = i;
        }
        return i;
    });
    return { pages, currentPage, pageSize };
}

function pageNumberToReqData(pagingData: PagingDataTye, pageNumber: number) {
    const { pageSize } = pagingData;
    return {
        fromLineNumber: pageSize * pageNumber,
        toLineNumber: pageSize * pageNumber + pageSize - 1,
    };
}

async function searchOnline(searchData: BibleSearchForType) {
    return testData;
}

export default function BibleOnlineSearchBodyPreviewer({
    bibleKey,
}: Readonly<{
    bibleKey: string,
}>) {
    const [inputText, setInputText] = useState('');
    const [data, setData] = useState<BibleSearchOnlineType | null>(null);
    const searchOnline1 = (searchData: BibleSearchForType) => {
        setData(null);
        searchOnline(searchData).then((data) => {
            setData(data);
        });
    };
    return (
        <div className='card overflow-hidden w-100 h-100'>
            <div className='card-body d-flex flex-column'>
                <div className='input-group' style={{
                    height: 25,
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
                            searchOnline1({ text: inputText });
                        }}>
                        <i className='bi bi-search' />
                    </button>
                </div>
                <hr />
                <div className='flex-fill'>
                    <RenderData
                        text={inputText} data={data}
                        searchFor={(from: number, to: number) => {
                            searchOnline1({
                                fromLineNumber: from,
                                toLineNumber: to,
                                text: inputText,
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function RenderData({
    text, data, searchFor,
}: Readonly<{
    text: string,
    data: BibleSearchOnlineType | null,
    searchFor: (from: number, to: number) => void,
}>) {
    if (data === null) {
        return (
            <div>No Data</div>
        );
    }
    const pagingData = calcPaging(data);
    if (pagingData === null) {
        return null;
    }
    const searchFor1 = (pageNumber: number) => {
        const searchForData = pageNumberToReqData(pagingData, pageNumber);
        searchFor(searchForData.fromLineNumber, searchForData.toLineNumber);
    };
    const { pages, currentPage } = pagingData;
    console.log(pagingData);

    return (
        <>
            <div className='card-body'>
                <h4>{text}</h4>
                <hr />
                {JSON.stringify(data.content)}
            </div>
            <div className='card-foot'>
                <nav>
                    <ul className='pagination'>
                        {currentPage !== 1 && <li className='page-item'>
                            <button className='page-link'
                                onClick={() => {
                                    searchFor1(currentPage - 1);
                                }}>
                                Previous
                            </button>
                        </li>}
                        {pages.map((pageNumber) => {
                            const isActive = currentPage === pageNumber;
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
                        {currentPage !== pages.length - 1 &&
                            <li className='page-item'>
                                <button className='page-link'
                                    onClick={() => {
                                        searchFor1(currentPage + 1);
                                    }}>
                                    Next
                                </button>
                            </li>
                        }
                    </ul>
                </nav>
            </div>
        </>
    );
}