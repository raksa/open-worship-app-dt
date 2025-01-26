import BibleItem from '../bible-list/BibleItem';
import { SearchBibleItemViewController } from '../bible-reader/BibleItemViewController';
import { BibleSearchOnlineType, breakItem } from './bibleOnlineHelpers';

export default function BibleOnlineRenderPerPageComp({
    pageNumber,
    data,
    searchingText,
    bibleKey,
}: Readonly<{
    pageNumber: string;
    data: BibleSearchOnlineType;
    searchingText: string;
    bibleKey: string;
}>) {
    const handleClicking = (event: any, bibleItem: BibleItem) => {
        const viewController = SearchBibleItemViewController.getInstance();
        if (event.shiftKey) {
            viewController.appendBibleItem(bibleItem);
        } else {
            viewController.setSearchingContentFromBibleItem(bibleItem);
        }
    };
    return (
        <>
            <div className="d-flex">
                <span>{pageNumber}</span>
                <hr className="w-100" />
            </div>
            <div className="w-100">
                {data.content.map(({ text, uniqueKey }) => {
                    const { newItem, kjvTitle, bibleItem } = breakItem(
                        searchingText,
                        text,
                        bibleKey,
                    );
                    return (
                        <button
                            className={
                                'btn btn-sm btn-outline-info ' +
                                'app-ellipsis w-100 overflow-hidden-x'
                            }
                            onClick={(event) => {
                                handleClicking(event, bibleItem);
                            }}
                            title="Shift + Click to append"
                            style={{ textAlign: 'left' }}
                            key={uniqueKey}
                        >
                            <span>{kjvTitle}</span> ...{' '}
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: newItem,
                                }}
                            />
                        </button>
                    );
                })}
            </div>
        </>
    );
}
