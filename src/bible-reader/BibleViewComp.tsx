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
import { useBibleItemContext } from './BibleItemContext';
import RenderBibleEditingHeader from '../bible-lookup/RenderBibleEditingHeader';
import RenderBibleLookupBodyComp from '../bible-lookup/RenderBibleLookupBodyComp';
import { useMemo } from 'react';
import LookupBibleItemController from './LookupBibleItemController';

export default function BibleViewComp() {
    const viewController = useBibleItemsViewControllerContext();
    const uuid = crypto.randomUUID();
    const bibleItem = useBibleItemContext();
    const isSelected = useMemo(() => {
        return (
            viewController instanceof LookupBibleItemController &&
            viewController.checkIsBibleItemSelected(bibleItem)
        );
    }, [viewController, bibleItem]);
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
                applyDragged(event, viewController, bibleItem);
            }}
            onContextMenu={async (event: any) => {
                showAppContextMenu(event, [
                    ...genDefaultBibleItemContextMenu(bibleItem),
                    ...(await viewController.genContextMenu(bibleItem, uuid)),
                ]);
            }}
        >
            {!isSelected ? <RenderHeaderComp /> : <RenderBibleEditingHeader />}
            <div className="card-body p-3">
                {isSelected ? (
                    <RenderBibleLookupBodyComp />
                ) : (
                    <BibleViewTextComp />
                )}
                <RenderToTheTopComp style={{ bottom: '60px' }} />
            </div>
        </div>
    );
}
