import BibleItem from '../bible-list/BibleItem';
import { bibleRenderHelper } from '../bible-list/bibleRenderHelpers';
import { BibleDirectViewTitleComp } from '../bible-reader/BibleViewExtra';
import { useLookupBibleItemControllerContext } from '../bible-reader/LookupBibleItemController';
import { handleClicking } from '../bible-search/bibleFindHelpers';
import { bibleObj } from '../helper/bible-helpers/serverBibleHelpers';
import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useAppPromise } from '../helper/helpers';
import { BibleRefType, useGetBibleRef } from './bibleRefsHelpers';

async function breakItem(bibleKey: string, bibleVerseKey: string) {
    const extracted = bibleRenderHelper.fromKJVBibleVersesKey(bibleVerseKey);
    const booksOrder = bibleObj.booksOrder;
    if (!booksOrder.includes(extracted.bookKey)) {
        return null;
    }
    const bibleItem = BibleItem.fromJson({
        id: -1,
        bibleKey,
        target: {
            bookKey: extracted.bookKey,
            chapter: extracted.chapter,
            verseStart: extracted.verseStart,
            verseEnd: extracted.verseEnd,
        },
        metadata: {},
    });
    await bibleItem.toTitle();
    const bibleText = await bibleItem.toText();
    return {
        htmlText: bibleText.substring(0, 150) + '...',
        bibleItem,
        bibleText,
    };
}

function RenderFoundItemComp({
    bibleKey,
    bibleVersesKey,
    itemInfo,
}: Readonly<{
    bibleKey: string;
    bibleVersesKey: string;
    itemInfo: BibleRefType;
}>) {
    const viewController = useLookupBibleItemControllerContext();
    const data = useAppPromise(breakItem(bibleKey, bibleVersesKey));
    if (data === undefined) {
        return <div>Loading...</div>;
    }
    if (data === null) {
        console.log(itemInfo);
        return (
            <div
                className="w-100 app-border-white-round my-2 p-2 pointer"
                style={{ color: 'red' }}
            >
                Fail to get data for "{bibleVersesKey}"
            </div>
        );
    }
    const { htmlText, bibleItem, bibleText } = data;
    return (
        <div
            className="w-100 app-border-white-round my-2 p-2 pointer"
            onClick={(event) => {
                handleClicking(event, viewController, bibleItem, true);
            }}
        >
            <BibleDirectViewTitleComp bibleItem={bibleItem} />
            {/* TODO: update title */}
            <span className="badge badge-success" title="isS">
                {itemInfo.isS ? 'S ' : ''}
            </span>
            <span className="badge badge-success" title="isFN">
                {itemInfo.isFN ? 'FN ' : ''}
            </span>
            <span className="badge badge-success" title="isStar">
                {itemInfo.isStar ? '★ ' : ''}
            </span>
            <span className="badge badge-success" title="isTitle">
                {itemInfo.isTitle ? 'T ' : ''}
            </span>
            <span className="badge badge-success" title="isLXXDSS">
                {itemInfo.isLXXDSS ? 'LXXDSS ' : ''}
            </span>
            <span
                title={bibleText}
                data-bible-key={bibleItem.bibleKey}
                dangerouslySetInnerHTML={{
                    __html: htmlText,
                }}
            />
        </div>
    );
}

function RefItemRendererComp({
    bibleKey,
    bookKey,
    chapter,
    verse,
    index,
}: Readonly<{
    bibleKey: string;
    bookKey: string;
    chapter: number;
    verse: number;
    index: number;
}>) {
    const bibleRef = useGetBibleRef(bookKey, chapter, verse);
    if (bibleRef === null) {
        return (
            <div>
                Failed to load bible ref for {bookKey} {chapter}:{verse}
            </div>
        );
    }
    return (
        <div className="w-100">
            {index !== 0 ? <hr /> : null}
            {bibleRef.map((items, i) => {
                return items.map((item, j) => {
                    return (
                        <RenderFoundItemComp
                            key={item.text + i + j}
                            bibleKey={bibleKey}
                            bibleVersesKey={item.text}
                            itemInfo={item}
                        />
                    );
                });
            })}
        </div>
    );
}

export default function RefRendererComp({
    bibleItem,
}: Readonly<{
    bibleItem: BibleItem;
}>) {
    const [title] = useAppStateAsync(() => {
        return bibleItem.toTitle();
    }, [bibleItem.bibleKey, bibleItem.target]);
    const { bookKey: book, chapter, verseStart, verseEnd } = bibleItem.target;
    const arr: number[] = [];
    for (let i = verseStart; i <= verseEnd; i++) {
        arr.push(i);
    }
    return (
        <div className="w-100">
            <h4 data-bible-key={bibleItem.bibleKey}>
                ({bibleItem.bibleKey}) {title}
            </h4>
            {arr.map((verse, i) => {
                return (
                    <RefItemRendererComp
                        key={verse}
                        bibleKey={bibleItem.bibleKey}
                        bookKey={book}
                        chapter={chapter}
                        verse={verse}
                        index={i}
                    />
                );
            })}
        </div>
    );
}
