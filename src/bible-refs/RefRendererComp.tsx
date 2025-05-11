import { useBibleItemRenderTitle } from '../bible-list/bibleItemHelpers';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import { useGetBibleRef } from './bibleRefsHelpers';

function RefItemRendererComp({
    bookKey,
    chapter,
    verse,
    index,
}: Readonly<{
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
    console.log(bibleRef);
    return (
        <div className="w-100">
            {index !== 0 ? <hr /> : null}
            {<code>{JSON.stringify(bibleRef)}</code>}
        </div>
    );
}

export default function RefRendererComp() {
    const bibleItem = useBibleItemContext();
    const bibleTitle = useBibleItemRenderTitle(bibleItem);
    const { bookKey: book, chapter, verseStart, verseEnd } = bibleItem.target;
    const arr: number[] = [];
    for (let i = verseStart; i <= verseEnd; i++) {
        arr.push(i);
    }
    return (
        <div className="w-100">
            <h4>
                ({bibleItem.bibleKey}) {bibleTitle}
            </h4>
            {arr.map((verse, i) => {
                return (
                    <RefItemRendererComp
                        key={verse}
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
