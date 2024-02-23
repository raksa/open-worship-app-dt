import './BibleView.scss';

import BibleItem from '../bible-list/BibleItem';
import {
    showAppContextMenu,
} from '../others/AppContextMenu';
import {
    useBibleItemViewControllerContext,
} from './BibleItemViewController';
import {
    applyDragged, genDraggingClass, removeDraggingClass,
} from './readBibleHelper';
import {
    BibleViewText, rendHeader,
} from './BibleViewExtra';
import {
    genDefaultBibleItemContextMenu,
} from '../bible-list/bibleItemHelpers';

export default function BibleView({
    bibleItem,
}: Readonly<{
    bibleItem: BibleItem,
}>) {
    const bibleItemViewController = useBibleItemViewControllerContext();
    return (
        <div className='bible-view card flex-fill w-100 h-100'
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
                applyDragged(event, bibleItemViewController, bibleItem);
            }}
            onContextMenu={(event: any) => {
                showAppContextMenu(event, [
                    ...genDefaultBibleItemContextMenu(bibleItem),
                    ...bibleItemViewController.genContextMenu(bibleItem),
                ]);
            }}>
            {
                rendHeader(
                    bibleItem,
                    (_oldBibleKey: string, newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone(true);
                        newBibleItem.bibleKey = newBibleKey;
                        bibleItemViewController.changeItem(
                            bibleItem, newBibleItem,
                        );
                    },
                    () => {
                        bibleItemViewController.removeItem(bibleItem);
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
