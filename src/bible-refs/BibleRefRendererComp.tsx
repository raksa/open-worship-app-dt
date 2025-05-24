import BibleItem from '../bible-list/BibleItem';
import { useAppStateAsync } from '../helper/debuggerHelpers';
import BibleRefItemRendererComp from './BibleRefItemRendererComp';

export default function BibleRefRendererComp({
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
                    <BibleRefItemRendererComp
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
