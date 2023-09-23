import './BibleView.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem from '../bible-list/BibleItem';
import {
    showBibleOption,
} from '../bible-search/BibleSelection';
import {
    useBibleItemRenderTitle,
    useBibleItemRenderText,
} from '../helper/bible-helpers/bibleRenderHelpers';
import BibleItemViewController from './BibleItemViewController';
import {
    applyDragged,
    genDraggingClass, removeDraggingClass,
} from './readBibleHelper';
import { rendHeader } from './BibleViewExtra';

function openContextMenu(
    bibleItemViewCtl: BibleItemViewController, event: React.MouseEvent,
    index: number,
) {
    showAppContextMenu(event as any, [{
        title: 'Split', onClick: () => {
            bibleItemViewCtl.duplicateItemAtIndexRight(index);
        },
    }, {
        title: 'Split To', onClick: () => {
            showBibleOption(event, [], (bibleKey: string) => {
                bibleItemViewCtl.duplicateItemAtIndexRight(
                    index, bibleKey,
                );
            });
        },
    }]);
}

export default function BibleView({
    index, bibleItem, fontSize,
    bibleItemViewController: bibleItemViewCtl,
}: {
    index: number,
    bibleItem: BibleItem,
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
}) {
    const title = useBibleItemRenderTitle(bibleItem);
    const text = useBibleItemRenderText(bibleItem);
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
                applyDragged(event, bibleItemViewCtl, index);
            }}
            onContextMenu={(event) => {
                openContextMenu(bibleItemViewCtl, event, index);
            }}>
            {
                rendHeader(
                    bibleItem.bibleKey, title,
                    (_oldBibleKey: string, newBibleKey: string) => {
                        bibleItemViewCtl.changeItemBibleKey(
                            index, newBibleKey);
                    },
                    () => {
                        bibleItemViewCtl.removeItem(index);
                    },
                    index,
                )
            }
            <div className='card-body p-3'>
                <p className='app-selectable-text' style={{
                    fontSize: `${fontSize}px`,
                }}>{text}</p>
                {/* TODO: implement this
                <RefRenderer bibleItem={bibleItem} /> */}
            </div>
        </div>
    );
}
