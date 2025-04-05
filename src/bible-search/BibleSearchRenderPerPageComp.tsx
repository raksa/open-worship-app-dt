import BibleItem from '../bible-list/BibleItem';
import { useBibleItemRenderTitle } from '../bible-list/bibleItemHelpers';
import { LookupBibleItemViewController } from '../bible-reader/BibleItemViewController';
import { BibleSearchResultType, breakItem } from './bibleSearchHelpers';

export const APP_FOUND_PAGE_CLASS = 'app-found-page';

function BibleViewTitleComp({ bibleItem }: Readonly<{ bibleItem: BibleItem }>) {
    const title = useBibleItemRenderTitle(bibleItem);
    return <span className="title app-border-white-round m-1 px-1">{title}</span>;
}

export default function BibleSearchRenderPerPageComp({
    pageNumber,
    data,
    searchText,
    bibleKey,
}: Readonly<{
    pageNumber: string;
    data: BibleSearchResultType;
    searchText: string;
    bibleKey: string;
}>) {
    const handleClicking = (event: any, bibleItem: BibleItem) => {
        const viewController = LookupBibleItemViewController.getInstance();
        if (event.shiftKey) {
            viewController.appendBibleItem(bibleItem);
        } else {
            viewController.setLookupContentFromBibleItem(bibleItem);
        }
    };
    return (
        <>
            <div className={`d-flex ${APP_FOUND_PAGE_CLASS}-${pageNumber}`}>
                <span>{pageNumber}</span>
                <hr className="w-100" />
            </div>
            <div className="w-100">
                {data.content.map(({ text, uniqueKey }) => {
                    const { newItem, bibleItem } = breakItem(
                        searchText,
                        text,
                        bibleKey,
                    );
                    return (
                        <div
                            className="w-100 app-border-white-round my-2 p-2 pointer"
                            key={uniqueKey}
                            title={text}
                            onClick={(event) => {
                                handleClicking(event, bibleItem);
                            }}
                        >
                            <BibleViewTitleComp bibleItem={bibleItem} />
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: newItem,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
}
