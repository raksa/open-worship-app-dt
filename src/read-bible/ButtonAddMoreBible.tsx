import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper from '../server/bible-helpers/bibleHelpers';
import BibleItem from '../bible-list/BibleItem';

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
                const addBibleView = (bibleName: string) => {
                    const newBibleItem = bibleItems[0].clone();
                    newBibleItem.bibleName = bibleName;
                    const newBibleItems = [
                        ...bibleItems,
                        newBibleItem,
                    ];
                    applyPresents(newBibleItems);
                };
                const bibleList = await bibleHelper.getBibleListWithStatus();
                const bibleItemingList = bibleItems.map(({ bibleName }) => {
                    return bibleName;
                });
                const bibleListFiltered = bibleList.filter(([bibleName]) => {
                    return !bibleItemingList.includes(bibleName);
                });
                showAppContextMenu(event as any,
                    bibleListFiltered.map(([bibleName, isAvailable]) => {
                        return {
                            title: bibleName,
                            disabled: !isAvailable,
                            onClick: () => {
                                addBibleView(bibleName);
                            },
                        };
                    }));
            }}>
            <i className='bi bi-plus' />
        </button>
    );
}
