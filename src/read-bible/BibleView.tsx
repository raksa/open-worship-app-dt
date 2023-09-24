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
    indices: number[], isHorizontal: boolean,
) {
    showAppContextMenu(event as any, [{
        title: 'Split', onClick: () => {
            bibleItemViewCtl.duplicateItemAtIndexRight(indices, isHorizontal);
        },
    }, {
        title: 'Split To', onClick: () => {
            showBibleOption(event, [], (bibleKey: string) => {
                bibleItemViewCtl.duplicateItemAtIndexRight(
                    indices, isHorizontal, bibleKey,
                );
            });
        },
    }]);
}

export default function BibleView({
    indices, bibleItem, fontSize, bibleItemViewController: bibleItemViewCtl,
    isHorizontal,
}: {
    indices: number[],
    bibleItem: BibleItem,
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
    isHorizontal: boolean,
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
                applyDragged(event, bibleItemViewCtl, indices, isHorizontal);
            }}
            onContextMenu={(event) => {
                openContextMenu(bibleItemViewCtl, event, indices, isHorizontal);
            }}>
            {
                rendHeader(
                    bibleItem.bibleKey, title,
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
                <p className='app-selectable-text' style={{
                    fontSize: `${fontSize}px`,
                }}>{text}</p>
                {/* TODO: implement this
                <RefRenderer bibleItem={bibleItem} /> */}
            </div>
        </div>
    );
}
