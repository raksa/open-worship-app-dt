import { genBookMatches } from '../helper/bible-helpers/serverBibleHelpers';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import { showSimpleToast } from '../toast/toastHelpers';
import {
    calcPaging, BibleSearchOnlineType, pageNumberToReqData, SelectedBookKeyType,
} from './bibleOnlineHelpers';
import BibleOnlineRenderPerPage from './BibleOnlineRenderPerPage';

async function selectBookKey(
    event: any, bibleKey: string, selectedBook: SelectedBookKeyType,
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
        ...bookList.map(([bookKey, localBookName, bookName]) => {
            const extraName = (
                localBookName !== bookName ? `(${bookName})` : ''
            );
            return {
                menuTitle: `${localBookName}${extraName}`,
                disabled: selectedBook?.[0] === bookKey,
                onClick: () => {
                    setSelectedBook([bookKey, localBookName]);
                },
            } as ContextMenuItemType;
        }),
    ]);
}

export default function BibleOnlineRenderData({
    text, allData, searchFor, bibleKey, selectedBook, setSelectedBook,
}: Readonly<{
    text: string,
    allData: { [key: string]: BibleSearchOnlineType },
    searchFor: (from: number, to: number) => void,
    bibleKey: string,
    selectedBook: SelectedBookKeyType,
    setSelectedBook: (_: SelectedBookKeyType) => void,
}>) {
    const genBookSection = (message: string) => {
        return (
            <div className='d-flex w-100'>
                <div className='flex-fill'>
                    <h4>{message}</h4>
                </div>
                <div>
                    <button className='btn btn-sm btn-info'
                        onClick={(event) => {
                            selectBookKey(
                                event, bibleKey, selectedBook,
                                setSelectedBook,
                            );
                        }}>
                        {
                            selectedBook === null ?
                                'all books' : selectedBook[1]
                        }
                    </button>
                </div>
            </div>
        );
    };
    const allPageNumberFound = Object.keys(allData);
    if (allPageNumberFound.length === 0) {
        return genBookSection('No Data');
    }
    const pagingData = calcPaging(allData[allPageNumberFound[0]]);
    const searchFor1 = (pageNumber: string) => {
        const searchForData = pageNumberToReqData(pagingData, pageNumber);
        searchFor(searchForData.fromLineNumber, searchForData.toLineNumber);
    };
    const { pages } = pagingData;
    return (
        <>
            <div className='card-body w-100'>
                {genBookSection(text)}
                {allPageNumberFound.map((pageNumber) => {
                    if (!pages.includes(pageNumber)) {
                        return null;
                    }
                    const data = allData[pageNumber];
                    return (
                        <BibleOnlineRenderPerPage key={pageNumber}
                            text={text}
                            data={data} pageNumber={pageNumber}
                            bibleKey={bibleKey}
                        />
                    );
                })}
            </div>
            <div className='card-footer' style={{
                maxHeight: 200,
                overflowY: 'auto',
            }}>
                <nav>
                    <ul className='pagination flex-wrap'>
                        {pages.map((pageNumber) => {
                            const isActive = allPageNumberFound.includes(
                                pageNumber,
                            );
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
                    </ul>
                </nav>
            </div>
        </>
    );
}
