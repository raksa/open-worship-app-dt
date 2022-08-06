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
            onClick={async (e) => {
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
                const bibleListFiltered = bibleList.filter(([bible]) => {
                    return !bibleItemingList.includes(bible);
                });
                showAppContextMenu(e, bibleListFiltered.map(([bible, isAvailable]) => {
                    return {
                        title: bible, disabled: !isAvailable, onClick: () => {
                            addBibleView(bible);
                        },
                    };
                }));
            }}>
            <i className='bi bi-plus' />
        </button>
    );
}
