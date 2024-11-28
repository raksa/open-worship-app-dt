import BibleItem from '../bible-list/BibleItem';
import { BibleSelectionMini } from '../bible-search/BibleSelection';
import { useGetBibleRef } from '../bible-refs/bibleRefsHelpers';
import {
    useBibleItemRenderTitle, useBibleItemVerseTextList,
} from '../bible-list/bibleItemHelpers';
import {
    fontSizeToHeightStyle, useBibleViewFontSize,
} from '../helper/bibleViewHelpers';
import { createContext, Fragment, useContext } from 'react';

export function RendHeader({
    bibleItem, onChange, onClose,
}: Readonly<{
    bibleItem: BibleItem,
    onChange: (oldBibleKey: string, newBibleKey: string) => void,
    onClose: () => void,
}>) {
    const fontSize = useBibleViewFontSize();
    return (
        <div className='card-header d-flex'
            style={fontSizeToHeightStyle(fontSize)}>
            <div className='flex-fill d-flex'>
                <div>
                    <BibleSelectionMini
                        bibleKey={bibleItem.bibleKey}
                        onBibleKeyChange={onChange}
                    />
                </div>
                <BibleViewTitle bibleItem={bibleItem} />
            </div>
            <div>
                <button className='btn-close'
                    onClick={() => {
                        onClose();
                    }}
                />
            </div>
        </div>
    );
}

export const BibleViewTitleMaterialContext = (
    createContext<{ onDBClick: (bibleItem: BibleItem) => void } | null>(null)
);

export function BibleViewTitle({ bibleItem }: Readonly<{
    bibleItem: BibleItem,
}>) {
    const materialContext = useContext(BibleViewTitleMaterialContext);
    const title = useBibleItemRenderTitle(bibleItem);
    const fontSize = useBibleViewFontSize();
    return (
        <div className='title' style={{ fontSize }}
            title={
                materialContext !== null ? 'Double click to edit' : undefined
            }
            onDoubleClick={() => {
                if (materialContext !== null) {
                    materialContext.onDBClick(bibleItem);
                }
            }}>
            {title}
        </div>
    );
}

export function BibleViewText({
    bibleItem,
}: Readonly<{
    bibleItem: BibleItem,
}>) {
    const fontSize = useBibleViewFontSize();
    const result = useBibleItemVerseTextList(bibleItem);
    if (result === null) {
        return null;
    }
    const handleSelection = (event: any) => {
        const currentTarget = event.currentTarget;
        const classList = currentTarget.classList;
        if (classList.contains('selected')) {
            classList.remove('selected');
        } else {
            currentTarget.parentElement?.childNodes.forEach((element: any) => {
                element.classList.remove('selected');
            });
            classList.add('selected');
        }
    };
    return (
        <div className='bible-view-text app-selectable-text py-3'
            style={{ fontSize: `${fontSize}px` }}>
            {result.map(([verse, text]) => {
                return (
                    <Fragment key={verse}>
                        <div className='verse-number'>
                            <div>{verse}</div>
                        </div>
                        <div className='verse-text'
                            onClick={handleSelection}
                        >{text}</div>
                    </Fragment>
                );
            })}
        </div>
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
