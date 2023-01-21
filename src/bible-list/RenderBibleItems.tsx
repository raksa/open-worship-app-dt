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
        <ul className='list-group' style={{
            minWidth: '220px',
            maxWidth: '380px',
        }}>
            {items.map((bibleItem, i1) => {
                return <BibleItemRender key={i1} index={i1}
                    warningMessage={genDuplicatedMessage(items, bibleItem, i1)}
                    bibleItem={bibleItem}
                    bible={bible}
                    onContextMenu={(event) => {
                        showAppContextMenu(event as any, [
                            {
                                title: 'Quick Edit',
                                onClick: () => {
                                    setSetting('bible-list-editing', `${i1}`);
                                    bibleItem.isSelectedEditing = true;
                                },
                            },
                            {
                                title: 'Duplicate',
                                onClick: () => {
                                    bible.duplicate(i1);
                                    bible.save();
                                },
                            },
                            {
                                title: 'Delete',
                                onClick: () => {
                                    bible.removeItem(bibleItem);
                                    bible.save();
                                },
                            },
                        ]);
                    }} />;
            })}
            {bible.isDefault && <div
                className='p-2 pointer border-white-round'
                style={{
                    margin: 'auto',
                    fontSize: '0.8rem',
                }}
                onClick={() => {
                    openBibleSearch();
                }}>
                Add Bible Item
            </div>}
        </ul>
    );
}
