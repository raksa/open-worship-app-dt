import './BibleViewComp.scss';

import BibleItem from '../bible-list/BibleItem';
import { showAppContextMenu } from '../others/AppContextMenuComp';
import { useBibleItemViewControllerContext } from './BibleItemViewController';
import {
    applyDragged,
    genDraggingClass,
    removeDraggingClass,
} from './readBibleHelpers';
import { BibleViewTextComp, RenderHeaderComp } from './BibleViewExtra';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';
import { BibleItemContext } from './BibleItemContext';

export default function BibleViewComp({
    bibleItem,
}: Readonly<{
    bibleItem: BibleItem;
}>) {
    const viewController = useBibleItemViewControllerContext();
    return (
        <BibleItemContext value={bibleItem}>
            <div
                className="bible-view card flex-fill w-100 h-100"
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
                    applyDragged(event, viewController, bibleItem);
                }}
                onContextMenu={(event: any) => {
                    showAppContextMenu(event, [
                        ...genDefaultBibleItemContextMenu(bibleItem),
                        ...viewController.genContextMenu(bibleItem),
                    ]);
                }}
            >
                <RenderHeaderComp
                    onChange={(_oldBibleKey: string, newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone(true);
                        newBibleItem.bibleKey = newBibleKey;
                        viewController.changeBibleItem(bibleItem, newBibleItem);
                    }}
                    onClose={() => {
                        viewController.deleteBibleItem(bibleItem);
                    }}
                />
                <div className="card-body p-3">
                    <BibleViewTextComp />
                    {/* TODO: implement this
                <RefRenderer /> */}
                </div>
            </div>
        </BibleItemContext>
    );
}

export function finalRenderer(bibleItem: BibleItem) {
    return <BibleViewComp bibleItem={bibleItem} />;
}
