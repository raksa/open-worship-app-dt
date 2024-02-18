import BibleItem from '../bible-list/BibleItem';
import {
    BibleSelectionMini,
} from '../bible-search/BibleSelection';
import { useGetBibleRef } from '../bible-refs/bibleRefsHelpers';
import {
    useBibleItemRenderText, useBibleItemRenderTitle,
} from '../bible-list/bibleItemHelpers';
import { getRandomUUID } from '../helper/helpers';
import { showAppContextMenu } from '../others/AppContextMenu';

export function rendHeader(
    bibleItem: BibleItem,
    onChange: (oldBibleKey: string, newBibleKey: string) => void,
    onClose: (indices: number[]) => void,
    indices: number[],
) {
    return (
        <div className='card-header'>
            <div className='d-flex'>
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
                            onClose(indices);
                        }} />
                </div>
            </div>
        </div>
    );
}

export function BibleViewTitle({ bibleItem }: Readonly<{
    bibleItem: BibleItem,
}>) {
    const uuid = getRandomUUID();
    const title = useBibleItemRenderTitle(bibleItem, uuid);
    return (
        <div id={uuid} className='title app-selectable-text'>
            {title}
        </div>
    );
}

function openBibleTextContextMenu(
    bibleItem: BibleItem, event: React.MouseEvent,
) {
    showAppContextMenu(event as any, [
        {
            title: 'Copy Title',
            onClick: () => {
                bibleItem.copyTitleToClipboard();
            },
        },
        {
            title: 'Copy Text',
            onClick: () => {
                bibleItem.copyTextToClipboard();
            },
        },
        {
            title: 'Copy',
            onClick: () => {
                bibleItem.copyToClipboard();
            },
        },
    ]);
}
export function BibleViewText({
    bibleItem, fontSize, isEnableContextMenu,
}: Readonly<{
    bibleItem: BibleItem,
    fontSize: number,
    isEnableContextMenu?: boolean,
}>) {
    const uuid = getRandomUUID();
    const text = useBibleItemRenderText(bibleItem, uuid);
    return (
        <p id={uuid}
            onContextMenu={(event) => {
                if (!isEnableContextMenu) {
                    return;
                }
                openBibleTextContextMenu(bibleItem, event);
            }}
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
