import { setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { genDuplicatedMessage } from '../server/bible-helpers/bibleHelpers';
import Bible from './Bible';
import BibleItemRender from './BibleItemRender';
import { openBibleSearch } from '../bible-search/HandleBibleSearch';

export default function RenderBibleItems({ bible }: {
    bible: Bible,
}) {
    const items = bible.items;
    return (
        <ul className='list-group'>
            {items.map((bibleItem, i1) => {
                return <BibleItemRender key={i1} index={i1}
                    warningMessage={genDuplicatedMessage(items, bibleItem, i1)}
                    bibleItem={bibleItem}
                    bible={bible}
                    onContextMenu={(e) => {
                        showAppContextMenu(e, [
                            {
                                title: 'Quick Edit', onClick: () => {
                                    setSetting('bible-list-editing', `${i1}`);
                                    bibleItem.isSelectedEditing = true;
                                },
                            },
                            {
                                title: 'Delete', onClick: () => {
                                    bible.removeItem(bibleItem);
                                },
                            },
                        ]);
                    }} />;
            })}
            {bible.isDefault && <button className='btn btn-outline-info btn-sm mt-2'
                onClick={() => openBibleSearch()}>
                Add Bible Item
            </button>}
        </ul>
    );
}
