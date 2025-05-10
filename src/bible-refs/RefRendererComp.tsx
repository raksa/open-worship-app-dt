import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import { useGetBibleRef } from './bibleRefsHelpers';

function RefItemRendererComp({
    bookKey,
    chapter,
    verse,
}: Readonly<{
    bookKey: string;
    chapter: number;
    verse: number;
}>) {
    const bibleRef = useGetBibleRef(bookKey, chapter, verse);
    return (
        <div>
            <hr />
            {bibleRef !== null && <code>{JSON.stringify(bibleRef)}</code>}
        </div>
    );
}

export default function RefRendererComp() {
    const bibleItem = useBibleItemContext();
    const { bookKey: book, chapter, verseStart, verseEnd } = bibleItem.target;
    const arr: number[] = [];
    for (let i = verseStart; i <= verseEnd; i++) {
        arr.push(i);
    }
    return arr.map((verse) => {
        return (
            <RefItemRendererComp
                key={verse}
                bookKey={book}
                chapter={chapter}
                verse={verse}
            />
        );
    });
}
