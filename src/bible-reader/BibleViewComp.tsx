import './BibleViewComp.scss';

import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import { useBibleItemsViewControllerContext } from './BibleItemsViewController';
import {
    applyDragged,
    genDraggingClass,
    removeDraggingClass,
} from './readBibleHelpers';
import { BibleViewTextComp, RenderHeaderComp } from './BibleViewExtra';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';
import RenderToTheTopComp from '../others/RenderToTheTopComp';
import RenderBibleEditingHeader from '../bible-lookup/RenderBibleEditingHeader';
import RenderBibleLookupBodyComp from '../bible-lookup/RenderBibleLookupBodyComp';
import { useMemo } from 'react';
import LookupBibleItemController from './LookupBibleItemController';
import BibleItem from '../bible-list/BibleItem';

export default function BibleViewComp({
    bibleItem,
}: Readonly<{
    bibleItem: BibleItem | null;
}>) {
    const viewController = useBibleItemsViewControllerContext();
    const uuid = crypto.randomUUID();
    const isSelected = useMemo(() => {
        return (
            bibleItem === null ||
            (viewController instanceof LookupBibleItemController &&
                viewController.checkIsBibleItemSelected(bibleItem))
        );
    }, [viewController, bibleItem]);
    const actualBibleItem = useMemo(() => {
        if (bibleItem !== null) {
            return bibleItem;
        }
        if (viewController instanceof LookupBibleItemController) {
            return viewController.selectedBibleItem;
        }
        return null;
    }, [bibleItem, viewController]);
    return (
        <div
            id={`uuid-${uuid}`}
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
                if (actualBibleItem === null) {
                    return;
                }
                applyDragged(event, viewController, actualBibleItem);
            }}
            onContextMenu={async (event: any) => {
                if (actualBibleItem === null) {
                    return;
                }
                showAppContextMenu(event, [
                    ...genDefaultBibleItemContextMenu(actualBibleItem),
                    ...(await viewController.genContextMenu(
                        actualBibleItem,
                        uuid,
                    )),
                ]);
            }}
        >
            {isSelected ? (
                <RenderBibleEditingHeader />
            ) : (
                <RenderHeaderComp bibleItem={bibleItem!} />
            )}
            <div className="card-body">
                {isSelected ? (
                    <RenderBibleLookupBodyComp />
                ) : (
                    <BibleViewTextComp bibleItem={bibleItem!} />
                )}
                <RenderToTheTopComp
                    style={{ bottom: '60px' }}
                    shouldSnowPlayToBottom
                />
            </div>
        </div>
    );
}
