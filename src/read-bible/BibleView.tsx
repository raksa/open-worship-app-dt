import './BibleView.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem from '../bible-list/BibleItem';
import {
    showBibleOption,
} from '../bible-search/BibleSelection';
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
        {
            title: 'Split Right', onClick: () => {
                bibleItemViewCtl.addBibleItemRight(bibleItem, bibleItem);
            },
        }, {
            title: 'Split Right To', onClick: () => {
                showBibleOption(event, [], (bibleKey: string) => {
                    const newBibleItem = bibleItem.clone();
                    newBibleItem.bibleKey = bibleKey;
                    bibleItemViewCtl.addBibleItemRight(bibleItem, newBibleItem);
                });
            },
        },
        {
            title: 'Split Bottom', onClick: () => {
                bibleItemViewCtl.addBibleItemBottom(bibleItem, bibleItem);
            },
        }, {
            title: 'Split Bottom To', onClick: () => {
                showBibleOption(event, [], (bibleKey: string) => {
                    const newBibleItem = bibleItem.clone();
                    newBibleItem.bibleKey = bibleKey;
                    bibleItemViewCtl.addBibleItemBottom(bibleItem, newBibleItem);
                });
            },
        },
    ]);
}

export default function BibleView({
    bibleItem, fontSize, bibleItemViewController: bibleItemViewCtl,
}: Readonly<{
    bibleItem: BibleItem,
    fontSize: number,
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
                        bibleItem.bibleKey = newBibleKey;
                    },
                    () => {
                        bibleItemViewCtl.removeItem(bibleItem);
                    },
                )
            }
            <div className='card-body p-3'>
                <BibleViewText
                    bibleItem={bibleItem}
                    fontSize={fontSize} />
                {/* TODO: implement this
                <RefRenderer bibleItem={bibleItem} /> */}
            </div>
        </div>
    );
}
