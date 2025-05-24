import './BibleViewComp.scss';

import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import { useBibleItemsViewControllerContext } from './BibleItemsViewController';
import {
    applyDropped,
    genDraggingClass,
    removeDraggingClass,
} from './readBibleHelpers';
import { BibleViewTextComp, RenderHeaderComp } from './BibleViewExtra';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';
import RenderToTheTopComp from '../others/RenderToTheTopComp';
import RenderBibleEditingHeader from '../bible-lookup/RenderBibleEditingHeader';
import RenderBibleLookupBodyComp from '../bible-lookup/RenderBibleLookupBodyComp';
import BibleItem from '../bible-list/BibleItem';
import { use } from 'react';
import { EditingResultContext } from './LookupBibleItemController';

export default function BibleViewComp({
    bibleItem,
    isEditing = false,
}: Readonly<{
    bibleItem: BibleItem;
    isEditing?: boolean;
}>) {
    const viewController = useBibleItemsViewControllerContext();
    const uuid = crypto.randomUUID();
    const editingResult = use(EditingResultContext);
    const foundBibleItem = isEditing
        ? (editingResult?.result.bibleItem ?? null)
        : bibleItem;
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
                applyDropped(event, viewController, bibleItem);
            }}
            onContextMenu={
                foundBibleItem === null
                    ? undefined
                    : async (event: any) => {
                          showAppContextMenu(event, [
                              ...genDefaultBibleItemContextMenu(foundBibleItem),
                              ...(await viewController.genContextMenu(
                                  foundBibleItem,
                                  uuid,
                              )),
                          ]);
                      }
            }
        >
            {isEditing ? (
                <RenderBibleEditingHeader />
            ) : (
                <RenderHeaderComp bibleItem={bibleItem} />
            )}
            <div className="card-body">
                {isEditing ? (
                    <RenderBibleLookupBodyComp />
                ) : (
                    <BibleViewTextComp bibleItem={bibleItem} />
                )}
                <RenderToTheTopComp
                    style={{ bottom: '60px' }}
                    shouldSnowPlayToBottom
                />
            </div>
        </div>
    );
}
