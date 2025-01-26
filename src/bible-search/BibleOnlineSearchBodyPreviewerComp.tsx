import { useState, useTransition } from 'react';

import {
    AllDataType,
    BibleSearchForType,
    searchOnline,
    calcPaging,
    findPageNumber,
    APIDataType,
    SelectedBookKeyType,
} from './bibleOnlineHelpers';
import BibleOnlineRenderDataComp from './BibleOnlineRenderDataComp';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import { useAppEffect, useAppEffectAsync } from '../helper/debuggerHelpers';
import { appApiFetch } from '../helper/networkHelpers';
import { handleError } from '../helper/errorHelpers';
import BibleSelectionComp from './BibleSelectionComp';
import LoadingComp from '../others/LoadingComp';

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

export default function BibleOnlineSearchBodyPreviewerComp() {
    const [apiData, setApiData] = useState<APIDataType | null | undefined>(
        undefined,
    );
    useAppEffectAsync(
        async (methodContext) => {
            if (apiData === undefined) {
                const apiData1 = await loadApiData();
                methodContext.setApiData(apiData1);
            }
        },
        [apiData],
        { setApiData },
    );
    if (apiData === undefined) {
        return <LoadingComp />;
    }
    if (apiData === null) {
        return (
            <div className="alert alert-warning">
                <i className="bi bi-info-circle" />
                <div className="ms-2">Fail to get api data!</div>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        setApiData(undefined);
                    }}
                >
                    Reload
                </button>
            </div>
        );
    }

    return <BibleOnlineSearchBody apiData={apiData} />;
}

function BibleOnlineSearchBody({
    apiData,
}: Readonly<{
    apiData: APIDataType;
}>) {
    const selectedBibleKey = useBibleKeyContext();
    const [bibleKey, setBibleKey] = useState(selectedBibleKey);
    const [selectedBook, setSelectedBook] = useState<SelectedBookKeyType>(null);
    const [inputText, setInputText] = useState('');
    const [searchingText, setSearchingText] = useState('');
    const [allData, setAllData] = useState<AllDataType>({});
    const [isSearching, startTransition] = useTransition();
    useAppEffect(() => {
        setBibleKey(selectedBibleKey);
    }, [selectedBibleKey]);

    const setBibleKey1 = (_: string, newBibleKey: string) => {
        setAllData({});
        setBibleKey(newBibleKey);
    };

    const doSearching = async (
        searchData: BibleSearchForType,
        isFresh = false,
    ) => {
        startTransition(async () => {
            const apiDataMap = apiData.mapper[bibleKey];
            if (selectedBook !== null) {
                searchData['bookKey'] = selectedBook.bookKey;
            }
            const data = await searchOnline(
                apiDataMap.apiUrl,
                apiDataMap.apiKey,
                searchData,
            );
            if (data !== null) {
                const { perPage, pages } = calcPaging(data);
                const pageNumber = findPageNumber(data, perPage, pages);
                const newAllData = {
                    ...(isFresh ? {} : allData),
                    [pageNumber]: data,
                };
                delete newAllData['0'];
                setAllData(newAllData);
            }
        });
    };
    const handleSearching = (isFresh = false) => {
        if (!inputText) {
            return;
        }
        setSearchingText(inputText);
        if (isFresh) {
            setAllData({});
        }
        const searchData: BibleSearchForType = { text: inputText };
        doSearching(searchData, isFresh);
    };
    return (
        <div className="card overflow-hidden w-100 h-100">
            <div className="card-header input-group overflow-hidden">
                <BibleSelectionComp
                    bibleKey={bibleKey}
                    onBibleKeyChange={setBibleKey1}
                />
                <input
                    type="text"
                    className="form-control"
                    value={inputText}
                    onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            event.stopPropagation();
                            alert('search');
                        }
                    }}
                    onChange={(event) => {
                        const value = event.target.value;
                        setInputText(value);
                    }}
                />
                <button
                    className="btn btn-sm"
                    disabled={isSearching || !inputText}
                    onClick={() => {
                        handleSearching(true);
                    }}
                >
                    <i className="bi bi-search" />
                </button>
            </div>
            <BibleOnlineRenderDataComp
                text={searchingText}
                allData={allData}
                searchFor={(from: number, to: number) => {
                    doSearching({
                        fromLineNumber: from,
                        toLineNumber: to,
                        text: searchingText,
                    });
                }}
                bibleKey={bibleKey}
                selectedBook={selectedBook}
                setSelectedBook={setSelectedBook}
                isSearching={isSearching}
            />
        </div>
    );
}
