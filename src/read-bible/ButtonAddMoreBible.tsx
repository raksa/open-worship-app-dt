import BibleItem from '../bible-list/BibleItem';
import { showBibleOption } from '../bible-search/BibleSelection';

export default function ButtonAddMoreBible({
    bibleItems, applyPresents,
}: Readonly<{
    bibleItems: BibleItem[],
    applyPresents: (bibleItem: BibleItem[]) => void,
}>) {
    return (
        <button className='btn btn-info btn-sm'
            disabled={bibleItems.length === 0}
            onClick={(event) => {
                showBibleOption(event, [],
                    (bibleKey: string) => {
                        const newBibleItem = bibleItems[0].clone();
                        newBibleItem.bibleKey = bibleKey;
                        const newBibleItems = [
                            ...bibleItems,
                            newBibleItem,
                        ];
                        applyPresents(newBibleItems);
                    });
            }}>
            <i className='bi bi-plus' /> Add Item
        </button>
    );
}
