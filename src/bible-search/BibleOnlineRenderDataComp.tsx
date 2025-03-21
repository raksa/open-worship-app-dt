import { genBookMatches } from '../helper/bible-helpers/serverBibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../others/AppContextMenuComp';
import LoadingComp from '../others/LoadingComp';
import { showSimpleToast } from '../toast/toastHelpers';
import {
    calcPaging,
    BibleSearchOnlineType,
    pageNumberToReqData,
    SelectedBookKeyType,
} from './bibleOnlineHelpers';
import BibleOnlineRenderPerPageComp from './BibleOnlineRenderPerPageComp';

async function selectBookKey(
    event: any,
    bibleKey: string,
    selectedBook: SelectedBookKeyType,
    setSelectedBook: (_: SelectedBookKeyType) => void,
) {
    const bookList = await genBookMatches(bibleKey, '');
    if (bookList === null) {
        showSimpleToast('Getting bible list', 'Fail to get bible list');
        return;
    }
    showAppContextMenu(event, [
        {
            menuTitle: 'all books',
            onClick: () => {
                setSelectedBook(null);
            },
        },
        ...bookList.map(({ bookKey, book, bookKJV, isAvailable }) => {
            const extraName = book !== bookKJV ? ` (${bookKJV})` : '';
            return {
                menuTitle: `${book}${extraName}`,
                disabled: !isAvailable || selectedBook?.bookKey === bookKey,
                onClick: () => {
                    setSelectedBook({ bookKey, book });
                },
            } as ContextMenuItemType;
        }),
    ]);
}

function RenderPageNumberComp({
    pageNumber,
    isActive,
    handleSearching,
}: Readonly<{
    pageNumber: string;
    isActive: boolean;
    handleSearching: (pageNumber: string) => void;
}>) {
    return (
        <li
            key={pageNumber}
            className={`page-item ${isActive ? 'active' : ''}`}
        >
            <button
                className="page-link"
                disabled={isActive}
                onClick={() => {
                    handleSearching(pageNumber);
                }}
            >
                {pageNumber}
            </button>
        </li>
    );
}

function ShowSearchingComp() {
    return (
        <div
            className="d-flex justify-content-center"
            ref={(element) => {
                if (element === null) {
                    return;
                }
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                });
            }}
        >
            <hr />
            <LoadingComp />
        </div>
    );
}

function RenderFooterComp({
    pages,
    allPageNumberFound,
    searchFor,
}: Readonly<{
    pages: string[];
    allPageNumberFound: string[];
    searchFor: (pageNumber: string) => void;
}>) {
    if (pages.length === 0) {
        return null;
    }
    return (
        <div
            className="card-footer p-0"
            style={{
                minHeight: 60,
                maxHeight: 200,
                overflowY: 'auto',
            }}
        >
            <nav>
                <ul className="pagination flex-wrap">
                    {pages.map((pageNumber) => {
                        const isActive =
                            allPageNumberFound.includes(pageNumber);
                        return (
                            <RenderPageNumberComp
                                key={pageNumber}
                                pageNumber={pageNumber}
                                isActive={isActive}
                                handleSearching={searchFor}
                            />
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

export default function BibleOnlineRenderDataComp({
    text,
    allData,
    searchFor,
    bibleKey,
    selectedBook,
    setSelectedBook,
    isSearching,
}: Readonly<{
    text: string;
    allData: { [key: string]: BibleSearchOnlineType };
    searchFor: (from: number, to: number) => void;
    bibleKey: string;
    selectedBook: SelectedBookKeyType;
    setSelectedBook: (_: SelectedBookKeyType) => void;
    isSearching: boolean;
}>) {
    useAppEffect(() => {
        setSelectedBook(null);
    }, [bibleKey]);
    const allPageNumberFound = Object.keys(allData);
    const pagingData = calcPaging(
        allPageNumberFound.length ? allData[allPageNumberFound[0]] : null,
    );
    const searchFor1 = (pageNumber: string) => {
        const searchForData = pageNumberToReqData(pagingData, pageNumber);
        searchFor(searchForData.fromLineNumber, searchForData.toLineNumber);
    };
    return (
        <>
            <div className="card-body w-100" style={{ height: 'inherit' }}>
                <div className="d-flex w-100">
                    <div className="flex-fill">
                        {text ? <span>{`Result for :"${text}"`}</span> : null}
                    </div>
                    <div>
                        <button
                            className="btn btn-sm btn-info"
                            onClick={(event) => {
                                selectBookKey(
                                    event,
                                    bibleKey,
                                    selectedBook,
                                    setSelectedBook,
                                );
                            }}
                        >
                            {selectedBook === null
                                ? 'All books'
                                : selectedBook.book}
                        </button>
                    </div>
                </div>
                {allPageNumberFound.map((pageNumber) => {
                    if (!pagingData.pages.includes(pageNumber)) {
                        return null;
                    }
                    const data = allData[pageNumber];
                    return (
                        <BibleOnlineRenderPerPageComp
                            key={pageNumber}
                            searchingText={text}
                            data={data}
                            pageNumber={pageNumber}
                            bibleKey={bibleKey}
                        />
                    );
                })}
                {isSearching ? <ShowSearchingComp /> : null}
            </div>
            <RenderFooterComp
                pages={pagingData.pages}
                allPageNumberFound={allPageNumberFound}
                searchFor={searchFor1}
            />
        </>
    );
}
