import { useState, useTransition } from 'react';

import {
    AllDataType,
    BibleSearchForType,
    calcPaging,
    findPageNumber,
    SelectedBookKeyType,
} from './bibleSearchHelpers';
import BibleSearchRenderDataComp from './BibleSearchRenderDataComp';
import BibleSelectionComp from '../bible-lookup/BibleSelectionComp';
import BibleSearchHeaderComp from './BibleSearchHeaderComp';
import SearchController from './SearchController';

export default function BibleSearchBodyComp({
    searchController,
    setBibleKey,
}: Readonly<{
    searchController: SearchController;
    setBibleKey: (_: string, newBibleKey: string) => void;
}>) {
    const [selectedBook, setSelectedBook] = useState<SelectedBookKeyType>(null);
    const [inputText, setInputText] = useState('');
    const [searchText, setSearchText] = useState('');
    const [allData, setAllData] = useState<AllDataType>({});
    const [isSearching, startTransition] = useTransition();

    const setSelectedBook1 = (newSelectedBook: SelectedBookKeyType) => {
        searchController.bookKey = newSelectedBook?.bookKey ?? null;
        setSelectedBook(newSelectedBook);
    };

    const doSearch = async (
        searchData: BibleSearchForType,
        isFresh = false,
    ) => {
        startTransition(async () => {
            if (selectedBook !== null) {
                searchData['bookKey'] = selectedBook.bookKey;
            }
            const data = await searchController.doSearch(searchData);
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
    const handleSearch = (isFresh = false) => {
        if (!inputText) {
            return;
        }
        setSearchText(inputText);
        if (isFresh) {
            setAllData({});
        }
        const searchData: BibleSearchForType = { text: inputText };
        doSearch(searchData, isFresh);
    };
    return (
        <div className="card overflow-hidden w-100 h-100">
            <div className="card-header input-group overflow-hidden">
                <BibleSelectionComp
                    bibleKey={searchController.bibleKey}
                    onBibleKeyChange={setBibleKey}
                />
                <BibleSearchHeaderComp
                    handleSearch={handleSearch}
                    isSearching={isSearching}
                    inputText={inputText}
                    setInputText={setInputText}
                />
            </div>
            <BibleSearchRenderDataComp
                text={searchText}
                allData={allData}
                searchFor={(from: number, to: number) => {
                    doSearch({
                        fromLineNumber: from,
                        toLineNumber: to,
                        text: searchText,
                    });
                }}
                bibleKey={searchController.bibleKey}
                selectedBook={selectedBook}
                setSelectedBook={setSelectedBook1}
                isSearch={isSearching}
            />
        </div>
    );
}
