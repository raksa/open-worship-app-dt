import { createContext, useContext } from 'react';

import BibleItem from '../bible-list/BibleItem';
import { BibleSelectionMini } from '../bible-search/BibleSelection';
import { useGetBibleRef } from '../bible-refs/bibleRefsHelpers';
import {
    useBibleItemRenderText, useBibleItemRenderTitle,
} from '../bible-list/bibleItemHelpers';
import { getRandomUUID } from '../helper/helpers';

export function RendHeader({
    bibleItem, onChange, onClose,
}: Readonly<{
    bibleItem: BibleItem,
    onChange: (oldBibleKey: string, newBibleKey: string) => void,
    onClose: () => void,
}>) {
    const fontSize = useContext(BibleViewFontSizeContext);
    return (
        <div className='card-header d-flex' style={{
            height: fontSize >= 20 ? (fontSize + 30) : undefined,
        }}>
            <div className='flex-fill d-flex'>
                <div>
                    <BibleSelectionMini
                        value={bibleItem.bibleKey}
                        onChange={onChange} />
                </div>
                <BibleViewTitle bibleItem={bibleItem} />
            </div>
            <div>
                <button className='btn-close'
                    onClick={() => {
                        onClose();
                    }} />
            </div>
        </div>
    );
}

export function BibleViewTitle({ bibleItem }: Readonly<{
    bibleItem: BibleItem,
}>) {
    const uuid = getRandomUUID();
    const title = useBibleItemRenderTitle(bibleItem, uuid);
    const fontSize = useContext(BibleViewFontSizeContext);
    return (
        <div id={uuid} className='title app-selectable-text'
            style={{ fontSize }}>
            {title}
        </div>
    );
}

export const DEFAULT_BIBLE_TEXT_FONT_SIZE = 16;
export const BibleViewFontSizeContext = createContext<number>(
    DEFAULT_BIBLE_TEXT_FONT_SIZE,
);

export function BibleViewText({
    bibleItem,
}: Readonly<{
    bibleItem: BibleItem,
}>) {
    const fontSize = useContext(BibleViewFontSizeContext);
    const uuid = getRandomUUID();
    const text = useBibleItemRenderText(bibleItem, uuid);
    return (
        <p id={uuid}
            className='app-selectable-text'
            style={{ fontSize: `${fontSize}px` }}>
            {text}
        </p>
    );
}


export function RefRenderer({ bibleItem }: Readonly<{ bibleItem: BibleItem }>) {
    const { bookKey: book, chapter, verseStart, verseEnd } = bibleItem.target;
    const arr: number[] = [];
    for (let i = verseStart; i <= verseEnd; i++) {
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
function RefItemRenderer({ bookKey, chapter, verse }: Readonly<{
    bookKey: string, chapter: number, verse: number
}>) {
    const bibleRef = useGetBibleRef(bookKey, chapter, verse);
    return (
        <div>
            <hr />
            {bibleRef !== null && <code>{JSON.stringify(bibleRef)}</code>}
        </div>
    );
}
