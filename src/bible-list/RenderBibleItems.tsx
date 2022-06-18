import { setSetting } from '../helper/settingHelper';
import { openBibleSearch } from '../bible-search/BibleSearchPopup';
import { showAppContextMenu } from '../others/AppContextMenu';
import { genDuplicatedMessage } from '../bible-helper/bibleHelpers';
import Bible from './Bible';
import BibleItemRender from './BibleItemRender';

export default function RenderBibleItems({
    bible, index, setBible,
}: {
    bible: Bible, index: number,
    setBible: (b: Bible, i: number) => void,
}) {
    const items = bible.content.items;
    return (
        <ul className='list-group'>
            {items.map((bibleItem, i1) => {
                return <BibleItemRender key={`${i1}`} index={i1}
                    warningMessage={genDuplicatedMessage(items, bibleItem, i1)}
                    bibleItem={bibleItem}
                    bible={bible}
                    onUpdateBiblePresent={(newBiblePresent) => {
                        items[i1] = newBiblePresent;
                        setBible(bible, index);
                    }}
                    onContextMenu={(e) => {
                        showAppContextMenu(e, [
                            {
                                title: 'Quick Edit', onClick: () => {
                                    setSetting('bible-list-editing', `${i1}`);
                                    openBibleSearch();
                                },
                            },
                            {
                                title: 'Delete', onClick: () => {
                                    bible.content.items = items.filter((_, i2) => {
                                        return i2 !== i1;
                                    });
                                    setBible(bible, index);
                                },
                            },
                        ]);
                    }} />;
            })}
        </ul>
    );
}
