import BibleItem from '../bible-list/BibleItem';
import { useBibleItemRenderTitle } from '../bible-list/bibleItemHelpers';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';
import { useAppPromise } from '../helper/helpers';
import { useBibleFindController } from './BibleFindController';
import { BibleFindResultType, breakItem } from './bibleFindHelpers';

export const APP_FOUND_PAGE_CLASS = 'app-found-page';

function BibleViewTitleComp({ bibleItem }: Readonly<{ bibleItem: BibleItem }>) {
    const title = useBibleItemRenderTitle(bibleItem);
    return (
        <span
            data-bible-key={bibleItem.bibleKey}
            className="title app-border-white-round m-1 px-1"
        >
            {title}
        </span>
    );
}

function RenderFoundItemComp({
    findText,
    text,
    bibleKey,
    handleClicking,
}: Readonly<{
    findText: string;
    text: string;
    bibleKey: string;
    handleClicking: (event: any, bibleItem: BibleItem) => void;
}>) {
    const bibleFindController = useBibleFindController();
    const data = useAppPromise(
        breakItem(bibleFindController.locale, findText, text, bibleKey),
    );
    if (data === undefined) {
        return <div>Loading...</div>;
    }
    if (data === null) {
        return <div>Fail to get data</div>;
    }
    const { newItem, bibleItem } = data;
    return (
        <div
            className="w-100 app-border-white-round my-2 p-2 pointer"
            title="shift + click to append"
            onClick={(event) => {
                handleClicking(event, bibleItem);
            }}
        >
            <BibleViewTitleComp bibleItem={bibleItem} />
            <span
                data-bible-key={bibleItem.bibleKey}
                dangerouslySetInnerHTML={{
                    __html: newItem,
                }}
            />
        </div>
    );
}

export default function BibleFindRenderPerPageComp({
    pageNumber,
    data,
    findText,
    bibleKey,
}: Readonly<{
    pageNumber: string;
    data: BibleFindResultType;
    findText: string;
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
                    return (
                        <RenderFoundItemComp
                            key={uniqueKey}
                            findText={findText}
                            text={text}
                            bibleKey={bibleKey}
                            handleClicking={handleClicking}
                        />
                    );
                })}
            </div>
        </>
    );
}
