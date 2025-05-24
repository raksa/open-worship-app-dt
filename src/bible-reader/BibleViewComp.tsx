import './BibleViewComp.scss';

import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import BibleItemsViewController, {
    useBibleItemsViewControllerContext,
} from './BibleItemsViewController';
import {
    applyDropped,
    genDraggingClass,
    removeDraggingClass,
} from './readBibleHelpers';
import { BibleViewTextComp, RenderHeaderComp } from './BibleViewExtra';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';
import ScrollingHandlerComp from '../scrolling/ScrollingHandlerComp';
import RenderBibleEditingHeader from '../bible-lookup/RenderBibleEditingHeader';
import RenderBibleLookupBodyComp from '../bible-lookup/RenderBibleLookupBodyComp';
import BibleItem from '../bible-list/BibleItem';
import { use } from 'react';
import { EditingResultContext } from './LookupBibleItemController';
import { useBibleViewFontSizeContext } from '../helper/bibleViewHelpers';
import {
    bringDomToNearestView,
    checkIsVerticalPartialInvisible,
} from '../helper/helpers';

function handMovedChecking(
    viewController: BibleItemsViewController,
    bibleItem: BibleItem,
    container: HTMLElement,
    threshold: number,
) {
    let kjvVerseKey = null;
    const currentElements = viewController.getVerseElements<HTMLElement>(
        bibleItem.id,
    );
    for (const currentElement of Array.from(currentElements).reverse()) {
        if (
            checkIsVerticalPartialInvisible(
                container,
                currentElement,
                threshold,
            )
        ) {
            kjvVerseKey = currentElement.dataset.kjvVerseKey;
            break;
        }
    }
    if (kjvVerseKey === null) {
        return;
    }
    const colorNote = viewController.getColorNote(bibleItem);
    const bibleItems = viewController
        .getBibleItemsByColorNote(colorNote)
        .filter((targetBibleItem) => {
            return bibleItem.id !== targetBibleItem.id;
        });
    bibleItems.forEach((targetBibleItem) => {
        const elements = viewController.getVerseElements<HTMLElement>(
            targetBibleItem.id,
            kjvVerseKey,
        );
        elements.forEach((element) => {
            bringDomToNearestView(element);
        });
    });
}

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
    const textViewFontSize = useBibleViewFontSizeContext();
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
            <div className="card-body app-top-hover-visible">
                {isEditing ? (
                    <RenderBibleLookupBodyComp />
                ) : (
                    <BibleViewTextComp bibleItem={bibleItem} />
                )}
                <ScrollingHandlerComp
                    style={{ bottom: '60px' }}
                    shouldSnowPlayToBottom
                    movedCheck={{
                        check: (container: HTMLElement) => {
                            handMovedChecking(
                                viewController,
                                bibleItem,
                                container,
                                textViewFontSize,
                            );
                        },
                        threshold: textViewFontSize,
                    }}
                />
            </div>
        </div>
    );
}
