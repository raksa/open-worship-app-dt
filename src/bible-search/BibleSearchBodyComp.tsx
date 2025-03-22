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
import { useBibleSearchController } from './BibleSearchController';

export default function BibleSearchBodyComp({
    setBibleKey,
}: Readonly<{
    setBibleKey: (_: string, newBibleKey: string) => void;
}>) {
    const bibleSearchController = useBibleSearchController();
    const [selectedBook, setSelectedBook] = useState<SelectedBookKeyType>(null);
    const [searchText, setSearchText] = useState('');
    const [allData, setAllData] = useState<AllDataType>({});
    const [isSearching, startTransition] = useTransition();
    const doSearch = async (
        searchData: BibleSearchForType,
        isFresh = false,
    ) => {
        startTransition(async () => {
            const data = await bibleSearchController.doSearch(searchData);
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
    const setSelectedBook1 = (newSelectedBook: SelectedBookKeyType) => {
        bibleSearchController.bookKey = newSelectedBook?.bookKey ?? null;
        setAllData({});
        setSelectedBook(newSelectedBook);
        if (bibleSearchController.searchText) {
            doSearch({ text: bibleSearchController.searchText }, true);
        }
    };
    const handleSearch = (isFresh = false) => {
        const searchText = bibleSearchController.searchText;
        if (!searchText) {
            return;
        }
        setSearchText(searchText);
        if (isFresh) {
            setAllData({});
        }
        const searchData: BibleSearchForType = {
            text: searchText,
        };
        doSearch(searchData, isFresh);
    };
    return (
        <div className="card overflow-hidden w-100 h-100">
            <div className="card-header input-group overflow-hidden">
                <BibleSelectionComp
                    onBibleKeyChange={setBibleKey}
                    bibleKey={bibleSearchController.bibleKey}
                />
                <BibleSearchHeaderComp
                    handleSearch={handleSearch}
                    isSearching={isSearching}
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
                selectedBook={selectedBook}
                setSelectedBook={setSelectedBook1}
                isSearch={isSearching}
            />
        </div>
    );
}
