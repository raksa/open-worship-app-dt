import './BibleView.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem from '../bible-list/BibleItem';
import { handleError } from '../helper/errorHelpers';
import {
    BibleSelectionMini, showBibleOption,
} from '../bible-search/BibleSelection';
import { useGetBibleRef } from '../bible-refs/bibleRefsHelpers';
import {
    useBibleItemRenderTitle,
    useBibleItemRenderText,
} from '../helper/bible-helpers/bibleRenderHelpers';
import BibleItemViewController from './BibleItemViewController';

export default function BibleView({
    index, bibleItem, fontSize,
    bibleItemViewController,
}: {
    index: number,
    bibleItem: BibleItem,
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
}) {
    const title = useBibleItemRenderTitle(bibleItem);
    const text = useBibleItemRenderText(bibleItem);
    return (
        <div className='bible-view card flex-fill'
            style={{ minWidth: '30%' }}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.classList.add('receiving-child');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.classList.remove('receiving-child');
            }}
            onDrop={async (event) => {
                event.currentTarget.classList.remove('receiving-child');
                const data = event.dataTransfer.getData('text');
                try {
                    const json = JSON.parse(data);
                    if (json.type === 'bibleItem') {
                        const bibleItem = BibleItem.fromJson(json.data);
                        bibleItemViewController.changeItemAtIndex(bibleItem, index);
                    }
                } catch (error) {
                    handleError(error);
                }
            }}
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [{
                    title: 'Split', onClick: () => {
                        bibleItemViewController.duplicateItemAtIndex(index);
                    },
                }, {
                    title: 'Split To', onClick: () => {
                        showBibleOption(event, [], (bibleKey: string) => {
                            bibleItemViewController.duplicateItemAtIndex(
                                index, bibleKey);
                        });
                    },
                }]);
            }}>
            {rendHeader(bibleItem.bibleKey, title,
                (oldBibleKey: string, newBibleKey: string) => {
                    bibleItemViewController.changeItemBibleKey(
                        index, newBibleKey);
                },
                () => {
                    bibleItemViewController.removeItem(index);
                }, index)}
            <div className='card-body p-3'>
                <p className='selectable-text' style={{
                    fontSize: `${fontSize}px`,
                }}>{text}</p>
                {/* TODO: implement this
                <RefRenderer bibleItem={bibleItem} /> */}
            </div>
        </div>
    );
}

function rendHeader(
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
                    <div className='title'>
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
