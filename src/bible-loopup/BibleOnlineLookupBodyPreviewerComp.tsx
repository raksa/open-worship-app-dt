import { useState, useTransition } from 'react';

import {
    AllDataType,
    BibleLookupForType,
    lookupOnline,
    calcPaging,
    findPageNumber,
    APIDataType,
    SelectedBookKeyType,
    APIDataMapType,
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

export default function BibleOnlineLookupBodyPreviewerComp() {
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

    return <BibleOnlineLookupBody apiData={apiData} />;
}

function BibleOnlineLookupBody({
    apiData,
}: Readonly<{
    apiData: APIDataType;
}>) {
    const selectedBibleKey = useBibleKeyContext();
    const [bibleKey, setBibleKey] = useState(selectedBibleKey);
    const [selectedBook, setSelectedBook] = useState<SelectedBookKeyType>(null);
    const [inputText, setInputText] = useState('');
    const [lookupText, setLookupText] = useState('');
    const [allData, setAllData] = useState<AllDataType>({});
    const [isLookup, startTransition] = useTransition();
    useAppEffect(() => {
        setBibleKey(selectedBibleKey);
    }, [selectedBibleKey]);

    const setBibleKey1 = (_: string, newBibleKey: string) => {
        setAllData({});
        setBibleKey(newBibleKey);
    };

    const doLookup = async (
        apiDataMap: APIDataMapType,
        lookupData: BibleLookupForType,
        isFresh = false,
    ) => {
        startTransition(async () => {
            if (selectedBook !== null) {
                lookupData['bookKey'] = selectedBook.bookKey;
            }
            const data = await lookupOnline(
                apiDataMap.apiUrl,
                apiDataMap.apiKey,
                lookupData,
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
    const handleLookup = (apiDataMap: APIDataMapType, isFresh = false) => {
        if (!inputText) {
            return;
        }
        setLookupText(inputText);
        if (isFresh) {
            setAllData({});
        }
        const lookupData: BibleLookupForType = { text: inputText };
        doLookup(apiDataMap, lookupData, isFresh);
    };
    const apiDataMap = apiData.mapper[bibleKey];
    return (
        <div className="card overflow-hidden w-100 h-100">
            <div className="card-header input-group overflow-hidden">
                <BibleSelectionComp
                    bibleKey={bibleKey}
                    onBibleKeyChange={setBibleKey1}
                />
                {apiDataMap === undefined ? (
                    <span className="p-2">
                        Api data map is not available, please use different
                        bible key
                    </span>
                ) : (
                    <>
                        <input
                            type="text"
                            className="form-control"
                            value={inputText}
                            onKeyUp={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    alert('lookup');
                                }
                            }}
                            onChange={(event) => {
                                const value = event.target.value;
                                setInputText(value);
                            }}
                        />
                        <button
                            className="btn btn-sm"
                            disabled={isLookup || !inputText}
                            onClick={() => {
                                handleLookup(apiDataMap, true);
                            }}
                        >
                            <i className="bi bi-search" />
                        </button>
                    </>
                )}
            </div>
            {apiDataMap && (
                <BibleOnlineRenderDataComp
                    text={lookupText}
                    allData={allData}
                    lookupFor={(from: number, to: number) => {
                        doLookup(apiDataMap, {
                            fromLineNumber: from,
                            toLineNumber: to,
                            text: lookupText,
                        });
                    }}
                    bibleKey={bibleKey}
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    isLookup={isLookup}
                />
            )}
        </div>
    );
}
