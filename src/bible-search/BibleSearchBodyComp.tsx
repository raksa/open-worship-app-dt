import { useState, useTransition } from 'react';

import {
    AllDataType,
    BibleSearchForType,
    searchOnline,
    calcPaging,
    findPageNumber,
    APIDataType,
    SelectedBookKeyType,
    APIDataMapType,
} from './bibleSearchHelpers';
import BibleSearchRenderDataComp from './BibleSearchRenderDataComp';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import BibleSelectionComp from '../bible-lookup/BibleSelectionComp';
import BibleSearchHeaderComp from './BibleSearchHeaderComp';

export default function BibleSearchBodyComp({
    apiData,
}: Readonly<{
    apiData: APIDataType;
}>) {
    const selectedBibleKey = useBibleKeyContext();
    const [bibleKey, setBibleKey] = useState(selectedBibleKey);
    const [selectedBook, setSelectedBook] = useState<SelectedBookKeyType>(null);
    const [inputText, setInputText] = useState('');
    const [searchText, setSearchText] = useState('');
    const [allData, setAllData] = useState<AllDataType>({});
    const [isSearching, startTransition] = useTransition();
    useAppEffect(() => {
        setBibleKey(selectedBibleKey);
    }, [selectedBibleKey]);

    const setBibleKey1 = (_: string, newBibleKey: string) => {
        setAllData({});
        setBibleKey(newBibleKey);
    };

    const doSearch = async (
        apiDataMap: APIDataMapType,
        searchData: BibleSearchForType,
        isFresh = false,
    ) => {
        startTransition(async () => {
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
    const handleSearch = (apiDataMap: APIDataMapType, isFresh = false) => {
        if (!inputText) {
            return;
        }
        setSearchText(inputText);
        if (isFresh) {
            setAllData({});
        }
        const searchData: BibleSearchForType = { text: inputText };
        doSearch(apiDataMap, searchData, isFresh);
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
                    <BibleSearchHeaderComp
                        apiDataMap={apiDataMap}
                        handleSearch={handleSearch}
                        isSearching={isSearching}
                        inputText={inputText}
                        setInputText={setInputText}
                    />
                )}
            </div>
            {apiDataMap && (
                <BibleSearchRenderDataComp
                    text={searchText}
                    allData={allData}
                    searchFor={(from: number, to: number) => {
                        doSearch(apiDataMap, {
                            fromLineNumber: from,
                            toLineNumber: to,
                            text: searchText,
                        });
                    }}
                    bibleKey={bibleKey}
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    isSearch={isSearching}
                />
            )}
        </div>
    );
}
