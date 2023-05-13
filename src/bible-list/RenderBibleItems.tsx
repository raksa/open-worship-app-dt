import { setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { genDuplicatedMessage } from '../helper/bible-helpers/serverBibleHelpers';
import Bible from './Bible';
import BibleItemRender from './BibleItemRender';
import { openBibleSearch } from '../bible-search/HandleBibleSearch';
import { useCallback } from 'react';
import BibleItem from './BibleItem';
import { moveBibleItemTo } from '../helper/bible-helpers/bibleHelpers';

function openBibleItemContextMenu(event: any,
    bible: Bible, bibleItem: BibleItem, index: number) {
    const menuItem = [
        {
            title: '(*T) ' + 'Quick Edit',
            onClick: () => {
                setSetting('bible-list-editing', `${index}`);
                bibleItem.isSelectedEditing = true;
            },
        },
        {
            title: '(*T) ' + 'Duplicate',
            onClick: () => {
                bible.duplicate(index);
                bible.save();
            },
        },
        {
            title: '(*T) ' + 'Move To',
            onClick: (event1: any) => {
                moveBibleItemTo(event1, bible, index);
            },
        },
        {
            title: '(*T) ' + 'Delete',
            onClick: () => {
                bible.removeItemAtIndex(index);
                bible.save();
            },
        },
    ];
    if (index !== 0) {
        menuItem.push({
            title: '(*T) ' + 'Move up',
            onClick: () => {
                bible.swapItem(index, index - 1);
                bible.save();
            },
        });
    }
    if (index !== bible.itemsLength - 1) {
        menuItem.push({
            title: '(*T) ' + 'Move down',
            onClick: () => {
                bible.swapItem(index, index + 1);
                bible.save();
            },
        });
    }
    showAppContextMenu(event, menuItem);
}

export default function RenderBibleItems({ bible }: {
    bible: Bible,
}) {
    const onContextMenuCallback = useCallback((event: any,
        bibleItem: BibleItem, index: number) => {
        openBibleItemContextMenu(event, bible, bibleItem, index);
    }, [bible]);
    const items = bible.items;
    return (
        <ul className='list-group' style={{
            minWidth: '220px',
            maxWidth: '380px',
        }}>
            {items.map((bibleItem, i1) => {
                return <BibleItemRender key={`${bibleItem.id}-${i1}`}
                    index={i1}
                    warningMessage={genDuplicatedMessage(items, bibleItem, i1)}
                    bibleItem={bibleItem}
                    bible={bible}
                    onContextMenu={onContextMenuCallback} />;
            })}
            {bible.isDefault && <div
                className='btn btn-info p-2 pointer border-white-round'
                style={{
                    margin: 'auto',
                    fontSize: '0.8rem',
                }}
                onClick={() => {
                    openBibleSearch();
                }}>
                <span title='Need translation'>(*T)</span> Add Bible Item
            </div>}
        </ul>
    );
}
