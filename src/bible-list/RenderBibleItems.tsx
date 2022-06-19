import { setSetting } from '../helper/settingHelper';
import { openBibleSearch } from '../bible-search/BibleSearchPopup';
import { showAppContextMenu } from '../others/AppContextMenu';
import { genDuplicatedMessage } from '../bible-helper/bibleHelpers';
import Bible from './Bible';
import BibleItemRender from './BibleItemRender';

export default function RenderBibleItems({
    bible,
}: {
    bible: Bible,
}) {
    const items = bible.content.items;
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
                                    openBibleSearch();
                                },
                            },
                            {
                                title: 'Delete', onClick: async () => {
                                    bible.content.items = items.filter((_, i2) => {
                                        return i2 !== i1;
                                    });
                                    await bible.save();
                                },
                            },
                        ]);
                    }} />;
            })}
        </ul>
    );
}
