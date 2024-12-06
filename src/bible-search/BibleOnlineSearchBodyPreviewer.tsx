import { useState } from 'react';

import {
    AllDataType, BibleSearchForType, searchOnline, calcPaging, findPageNumber,
    APIDataType, SelectedBookKeyType,
} from './bibleOnlineHelpers';
import BibleOnlineRenderData from './BibleOnlineRenderData';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { appApiFetch } from '../helper/networkHelpers';
import { handleError } from '../helper/errorHelpers';
import BibleSelection from './BibleSelection';

async function loadApiData() {
    try {
        const content = await appApiFetch('bible-online-info.json');
        const json = await content.json();
        if (typeof json.mapper !== 'object') {
            throw new Error('Cannot get bible list');
        }
        return json as APIDataType;
    } catch (error) {
        handleError(error);
    }
    return null;
}

export default function BibleOnlineSearchBodyPreviewer() {
    const [apiData, setApiData] = useState<APIDataType | null | undefined>(
        undefined,
    );
    useAppEffectAsync(async (methodContext) => {
        if (apiData === undefined) {
            const apiData1 = await loadApiData();
            methodContext.setApiData(apiData1);
        }
    }, [apiData], { methods: { setApiData } });
    if (apiData === undefined) {
        return (
            <div>Loading...</div>
        );
    }
    if (apiData === null) {
        return (
            <div className='alert alert-warning'>
                <i className='bi bi-info-circle' />
                <div className='ms-2'>
                    Fail to get api data!
                </div>
                <button className='btn btn-info'
                    onClick={() => {
                        setApiData(undefined);
                    }}>
                    Reload
                </button>
            </div>
        );
    }

    return (
        <BibleOnlineSearchBody apiData={apiData} />
    );
}

function BibleOnlineSearchBody({ apiData }: Readonly<{
    apiData: APIDataType,
}>) {
    const selectedBibleKey = useBibleKeyContext();
    const [bibleKey, setBibleKey] = useState(selectedBibleKey);
    const [selectedBook, setSelectedBook] = useState<SelectedBookKeyType>(
        null,
    );
    const [inputText, setInputText] = useState('');
    const [searchingText, setSearchingText] = useState('');
    const [allData, setAllData] = useState<AllDataType>({});

    const setBibleKey1 = (_: string, newBibleKey: string) => {
        setAllData({});
        setBibleKey(newBibleKey);
    };

    const searchOnline1 = (searchData: BibleSearchForType) => {
        const apiDataMap = apiData.mapper[bibleKey];
        if (selectedBook !== null) {
            searchData['bookKey'] = selectedBook[0];
        }
        searchOnline(
            apiDataMap.apiUrl, apiDataMap.apiKey, searchData,
        ).then((data) => {
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
                <BibleSelection bibleKey={bibleKey}
                    onBibleKeyChange={setBibleKey1}
                />
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
                bibleKey={bibleKey}
                selectedBook={selectedBook}
                setSelectedBook={setSelectedBook}
            />
        </div>
    );
}
