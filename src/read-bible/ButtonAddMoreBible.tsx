import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem from '../bible-list/BibleItem';
import { getBibleInfoWithStatusList } from '../server/bible-helpers/bibleHelpers';

export default function ButtonAddMoreBible({
    bibleItems, applyPresents,
}: {
    bibleItems: BibleItem[],
    applyPresents: (bibleItem: BibleItem[]) => void,
}) {
    return (
        <button className='btn btn-info'
            style={{
                width: '20px',
                padding: '0px',
            }}
            onClick={async (event) => {
                const addBibleView = (bibleKey: string) => {
                    const newBibleItem = bibleItems[0].clone();
                    newBibleItem.bibleKey = bibleKey;
                    const newBibleItems = [
                        ...bibleItems,
                        newBibleItem,
                    ];
                    applyPresents(newBibleItems);
                };
                const bibleList = await getBibleInfoWithStatusList();
                const bibleItemingList = bibleItems.map(({ bibleKey }) => {
                    return bibleKey;
                });
                const bibleListFiltered = bibleList.filter(([bibleKey]) => {
                    return !bibleItemingList.includes(bibleKey);
                });
                showAppContextMenu(event as any,
                    bibleListFiltered.map(([bibleKey, isAvailable]) => {
                        return {
                            title: bibleKey,
                            disabled: !isAvailable,
                            onClick: () => {
                                addBibleView(bibleKey);
                            },
                        };
                    }));
            }}>
            <i className='bi bi-plus' />
        </button>
    );
}
