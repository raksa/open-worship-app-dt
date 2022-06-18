import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper from '../bible-helper/bibleHelpers';
import BibleItem from '../bible-list/BibleItem';

export default function ButtonAddMoreBible({ bibleItems, applyPresents }: {
    bibleItems: BibleItem[],
    applyPresents: (bs: BibleItem[]) => void,
}) {
    return (
        <button className='btn btn-info'
            style={{
                width: '20px',
                padding: '0px',
            }}
            onClick={async (e) => {
                const addBibleView = (bible: string) => {
                    const newPresent = JSON.parse(JSON.stringify(bibleItems[0])) as BibleItem;
                    newPresent.bible = bible;
                    const newPresents = [...bibleItems, newPresent];
                    applyPresents(newPresents);
                };
                const bibleList = await bibleHelper.getBibleListWithStatus();
                const bibleItemingList = bibleItems.map(({ bible: bibleViewing }) => bibleViewing);
                const bibleListFiltered = bibleList.filter(([bible]) => !~bibleItemingList.indexOf(bible));

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
