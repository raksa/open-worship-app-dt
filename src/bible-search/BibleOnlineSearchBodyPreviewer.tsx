import { useContext, useState } from 'react';

import {
    AllDataType, BibleSearchForType, searchOnline, calcPaging, findPageNumber,
} from './bibleOnlineHelpers';
import BibleOnlineRenderData from './BibleOnlineRenderData';
import { SelectedBibleKeyContext } from '../bible-list/bibleHelpers';

export default function BibleOnlineSearchBodyPreviewer() {
    const bibleKey = useContext(SelectedBibleKeyContext);
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
            <BibleOnlineRenderData
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
