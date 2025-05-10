import { genBookMatches } from '../helper/bible-helpers/serverBibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';
import LoadingComp from '../others/LoadingComp';
import { showSimpleToast } from '../toast/toastHelpers';
import {
    calcPaging,
    BibleSearchResultType,
    pageNumberToReqData,
    SelectedBookKeyType,
} from './bibleSearchHelpers';
import BibleSearchRenderPerPageComp, {
    APP_FOUND_PAGE_CLASS,
} from './BibleSearchRenderPerPageComp';
import { useBibleSearchController } from './BibleSearchController';
import { bringDomToBottomView, bringDomToTopView } from '../helper/helpers';

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
            onSelect: () => {
                setSelectedBook(null);
            },
        },
        ...bookList.map(({ bookKey, book, bookKJV, isAvailable }) => {
            const extraName = book !== bookKJV ? ` (${bookKJV})` : '';
            return {
                menuTitle: `${book}${extraName}`,
                disabled: !isAvailable || selectedBook?.bookKey === bookKey,
                onSelect: () => {
                    setSelectedBook({ bookKey, book });
                },
            } as ContextMenuItemType;
        }),
    ]);
}

function RenderPageNumberComp({
    pageNumber,
    isActive,
    handleSearch,
}: Readonly<{
    pageNumber: string;
    isActive: boolean;
    handleSearch: (pageNumber: string) => void;
}>) {
    return (
        <li
            key={pageNumber}
            className={`page-item ${isActive ? 'active' : ''}`}
        >
            <button
                className="page-link"
                onClick={() => {
                    if (isActive) {
                        const dom = document.querySelector(
                            `.${APP_FOUND_PAGE_CLASS}-${pageNumber}`,
                        );
                        if (dom !== null) {
                            bringDomToTopView(dom);
                        }
                        return;
                    }
                    handleSearch(pageNumber);
                }}
            >
                {pageNumber}
            </button>
        </li>
    );
}

function ShowSearchComp() {
    return (
        <div
            className="d-flex justify-content-center"
            ref={(element) => {
                if (element === null) {
                    return;
                }
                bringDomToBottomView(element);
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
                                handleSearch={searchFor}
                            />
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

export default function BibleSearchRenderDataComp({
    text,
    allData,
    searchFor,
    selectedBook,
    setSelectedBook,
    isSearch,
}: Readonly<{
    text: string;
    allData: { [key: string]: BibleSearchResultType };
    searchFor: (from: number, to: number) => void;
    selectedBook: SelectedBookKeyType;
    setSelectedBook: (_: SelectedBookKeyType) => void;
    isSearch: boolean;
}>) {
    const bibleSearchController = useBibleSearchController();
    useAppEffect(() => {
        setSelectedBook(null);
    }, [bibleSearchController]);
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
                                    bibleSearchController.bibleKey,
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
                        <BibleSearchRenderPerPageComp
                            key={pageNumber}
                            searchText={text}
                            data={data}
                            pageNumber={pageNumber}
                            bibleKey={bibleSearchController.bibleKey}
                        />
                    );
                })}
                {isSearch ? <ShowSearchComp /> : null}
            </div>
            <RenderFooterComp
                pages={pagingData.pages}
                allPageNumberFound={allPageNumberFound}
                searchFor={searchFor1}
            />
        </>
    );
}
