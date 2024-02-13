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

function openContextMenu(
    bibleItemViewCtl: BibleItemViewController, event: React.MouseEvent,
    indices: number[], isHorizontal: boolean,
) {
    showAppContextMenu(event as any, [
        {
            title: 'Split Right', onClick: () => {
                bibleItemViewCtl.duplicateItemAtIndexRight(
                    indices, isHorizontal,
                );
            },
        }, {
            title: 'Split Right To', onClick: () => {
                showBibleOption(event, [], (bibleKey: string) => {
                    bibleItemViewCtl.duplicateItemAtIndexRight(
                        indices, isHorizontal, bibleKey,
                    );
                });
            },
        },
        {
            title: 'Split Bottom', onClick: () => {
                bibleItemViewCtl.duplicateItemAtIndexBottom(
                    indices, isHorizontal,
                );
            },
        }, {
            title: 'Split Bottom To', onClick: () => {
                showBibleOption(event, [], (bibleKey: string) => {
                    bibleItemViewCtl.duplicateItemAtIndexBottom(
                        indices, isHorizontal, bibleKey,
                    );
                });
            },
        },
    ]);
}

export default function BibleView({
    indices, bibleItem, fontSize, bibleItemViewController: bibleItemViewCtl,
    isHorizontal,
}: Readonly<{
    indices: number[],
    bibleItem: BibleItem,
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
    isHorizontal: boolean,
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
                applyDragged(event, bibleItemViewCtl, indices, isHorizontal);
            }}
            onContextMenu={(event) => {
                openContextMenu(bibleItemViewCtl, event, indices, isHorizontal);
            }}>
            {
                rendHeader(
                    bibleItem,
                    (_oldBibleKey: string, newBibleKey: string) => {
                        bibleItemViewCtl.changeItemBibleKey(
                            indices, newBibleKey,
                        );
                    },
                    () => {
                        bibleItemViewCtl.removeItem(indices);
                    },
                    indices,
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
