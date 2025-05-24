import { useGetBibleRef } from './bibleRefsHelpers';
import RenderFoundItemComp from './RenderFoundItemComp';

export default function RefItemRendererComp({
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
