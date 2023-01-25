import { setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { genDuplicatedMessage } from '../server/bible-helpers/bibleHelpers';
import Bible from './Bible';
import BibleItemRender from './BibleItemRender';
import { openBibleSearch } from '../bible-search/HandleBibleSearch';
import { useCallback } from 'react';
import BibleItem from './BibleItem';

export default function RenderBibleItems({ bible }: {
    bible: Bible,
}) {
    const onContextMenuCallback = useCallback((event: any,
        bibleItem: BibleItem, index: number) => {
        showAppContextMenu(event, [
            {
                title: 'Quick Edit',
                onClick: () => {
                    setSetting('bible-list-editing', `${index}`);
                    bibleItem.isSelectedEditing = true;
                },
            },
            {
                title: 'Duplicate',
                onClick: () => {
                    bible.duplicate(index);
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
    }, [bible]);
    const items = bible.items;
    return (
        <ul className='list-group' style={{
            minWidth: '220px',
            maxWidth: '380px',
        }}>
            {items.map((bibleItem, i1) => {
                return <BibleItemRender key={bibleItem.id} index={i1}
                    warningMessage={genDuplicatedMessage(items, bibleItem, i1)}
                    bibleItem={bibleItem}
                    bible={bible}
                    onContextMenu={onContextMenuCallback} />;
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
