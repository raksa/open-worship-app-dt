import './BibleView.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem from '../bible-list/BibleItem';
import BibleItemViewController from './BibleItemViewController';
import {
    applyDragged, genDraggingClass, removeDraggingClass,
} from './readBibleHelper';
import { BibleViewText, rendHeader } from './BibleViewExtra';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';

function openContextMenu(
    bibleItemViewCtl: BibleItemViewController, event: React.MouseEvent,
    bibleItem: BibleItem,
) {
    showAppContextMenu(event as any, [
        ...genDefaultBibleItemContextMenu(bibleItem),
        ...bibleItemViewCtl.genContextMenu(bibleItem),
    ]);
}

export default function BibleView({
    bibleItem, bibleItemViewController: bibleItemViewCtl,
}: Readonly<{
    bibleItem: BibleItem,
    bibleItemViewController: BibleItemViewController,
}>) {
    return (
        <div className='bible-view card flex-fill'
            style={{ minWidth: '30%' }}
            onDragOver={(event) => {
                event.preventDefault();
                removeDraggingClass(event);
                const className = genDraggingClass(event);
                event.currentTarget.classList.add(className);
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                removeDraggingClass(event);
            }}
            onDrop={async (event) => {
                applyDragged(event, bibleItemViewCtl, bibleItem);
            }}
            onContextMenu={(event) => {
                openContextMenu(
                    bibleItemViewCtl, event, bibleItem,
                );
            }}>
            {
                rendHeader(
                    bibleItem,
                    (_oldBibleKey: string, newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone(true);
                        newBibleItem.bibleKey = newBibleKey;
                        bibleItemViewCtl.changeItem(bibleItem, newBibleItem);
                    },
                    () => {
                        bibleItemViewCtl.removeItem(bibleItem);
                    },
                )
            }
            <div className='card-body p-3'>
                <BibleViewText
                    bibleItem={bibleItem}
                />
                {/* TODO: implement this
                <RefRenderer bibleItem={bibleItem} /> */}
            </div>
        </div>
    );
}
