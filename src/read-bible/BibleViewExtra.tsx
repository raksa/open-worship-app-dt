import BibleItem from '../bible-list/BibleItem';
import {
    BibleSelectionMini,
} from '../bible-search/BibleSelection';
import { useGetBibleRef } from '../bible-refs/bibleRefsHelpers';

export function rendHeader(
    key: string, title: string,
    onChange: (oldBibleKey: string, newBibleKey: string) => void,
    onClose: (index: number) => void, index: number,
) {
    return (
        <div className='card-header'>
            <div className='d-flex'>
                <div className='flex-fill d-flex'>
                    <div>
                        <BibleSelectionMini value={key}
                            onChange={onChange} />
                    </div>
                    <div className='title app-selectable-text'>
                        {title}
                    </div>
                </div>
                <div>
                    <button className='btn-close'
                        onClick={() => {
                            onClose(index);
                        }} />
                </div>
            </div>
        </div>
    );
}

export function RefRenderer({ bibleItem }: { bibleItem: BibleItem }) {
    const { book, chapter, startVerse, endVerse } = bibleItem.target;
    const arr: number[] = [];
    for (let i = startVerse; i <= endVerse; i++) {
        arr.push(i);
    }
    return (
        <>
            {arr.map((verse) => {
                return (
                    <RefItemRenderer key={verse} bookKey={book}
                        chapter={chapter} verse={verse} />
                );
            })}
        </>
    );
}
function RefItemRenderer({ bookKey, chapter, verse }: {
    bookKey: string, chapter: number, verse: number
}) {
    const bibleRef = useGetBibleRef(bookKey, chapter, verse);
    return (
        <div>
            <hr />
            {bibleRef !== null && <code>{JSON.stringify(bibleRef)}</code>}
        </div>
    );
}
