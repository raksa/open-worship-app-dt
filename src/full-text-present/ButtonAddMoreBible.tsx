import { BiblePresentType } from './fullTextPresentHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper from '../bible-helper/bibleHelpers';

export default function ButtonAddMoreBible({ biblePresents, applyPresents }: {
    biblePresents: BiblePresentType[],
    applyPresents: (bs: BiblePresentType[]) => void,
}) {
    return (
        <button className='btn btn-info'
            style={{
                width: '20px',
                padding: '0px',
            }}
            onClick={async (e) => {
                const addBibleView = (bible: string) => {
                    const newPresent = JSON.parse(JSON.stringify(biblePresents[0])) as BiblePresentType;
                    newPresent.bible = bible;
                    const newPresents = [...biblePresents, newPresent];
                    applyPresents(newPresents);
                };
                const bibleList = await bibleHelper.getBibleListWithStatus();
                const biblePresentingList = biblePresents.map(({ bible: bibleViewing }) => bibleViewing);
                const bibleListFiltered = bibleList.filter(([bible]) => !~biblePresentingList.indexOf(bible));

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
