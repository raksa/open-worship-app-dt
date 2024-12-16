import { useOptimistic, useState } from 'react';

import {
    KeyboardType, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItemGhost from './SlideItemGhost';
import { useSelectedSlideContext } from '../../slide-list/Slide';
import { useFileSourceEvents } from '../../helper/dirSourceHelpers';
import { genArrowListener } from './slideItemHelpers';
import SlideItemRenderWrapper from './SlideItemRenderWrapper';
import { DEFAULT_THUMBNAIL_SIZE_FACTOR } from '../../slide-list/slideHelpers';
import SlideItem, {
    useSelectedEditingSlideItemSetterContext,
} from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';
import { useAppEffect } from '../../helper/debuggerHelpers';
import { useProgressBarComp } from '../../progress-bar/ProgressBarComp';

const slideItemsToView: { [key: string]: SlideItem } = {};
function useSlideItems() {
    const selectedSlide = useSelectedSlideContext();
    const setSelectedSlideItem = useSelectedEditingSlideItemSetterContext();
    const [slideItems, setSlideItems] = useOptimistic<SlideItem[]>(
        selectedSlide.items,
    );
    const { startTransaction, progressBarChild } = useProgressBarComp();
    const setSlideItems1 = (newSlideItems: SlideItem[]) => {
        startTransaction(() => {
            setSlideItems(newSlideItems);
        });
    };
    useFileSourceEvents(
        ['edit'], selectedSlide.filePath,
        (editingSlideItem: any) => {
            if (!(editingSlideItem instanceof SlideItem)) {
                return;
            }
            // clear the slideItemsToView
            const newSlideItems = slideItems.map((item) => {
                if (item.checkIsSame(editingSlideItem)) {
                    slideItemsToView[editingSlideItem.id] = editingSlideItem;
                    return editingSlideItem;
                } else {
                    return item;
                }
            });
            setSlideItems1(newSlideItems);
        }
    );
    useFileSourceEvents(
        ['update'], selectedSlide.filePath,
        () => {
            setSlideItems1(selectedSlide.items);
        }
    );
    useFileSourceEvents(
        ['new'], selectedSlide.filePath,
        (newSlideItems: any) => {
            if (
                newSlideItems === undefined ||
                !(newSlideItems instanceof Array)
            ) {
                return;
            }
            const oldIds = new Set(slideItems.map((item) => {
                return item.id;
            }));
            newSlideItems = newSlideItems.map((item) => {
                if (oldIds.has(item.id)) {
                    return slideItems.find((oldItem) => {
                        return oldItem.id === item.id;
                    });
                } else {
                    slideItemsToView[item.id] = item;
                    return item;
                }
            });
            setSlideItems1(newSlideItems);
        }
    );
    useFileSourceEvents(
        ['delete'], selectedSlide.filePath,
        (deletedSlideItem: any) => {
            if (deletedSlideItem instanceof SlideItem) {
                const newSlideItems = slideItems.filter((item) => {
                    return !item.checkIsSame(deletedSlideItem);
                });
                setSlideItems1(newSlideItems);
            }
        }
    );
    const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];
    const arrowListener = (
        appProvider.isPageEditor ? () => { } :
            genArrowListener(setSelectedSlideItem, selectedSlide, slideItems)
    );
    useKeyboardRegistering(arrows.map((key) => {
        return { key };
    }), arrowListener);
    return { slideItems, progressBarChild };
}

export default function SlideItems() {
    const [thumbSizeScale] = useSlideItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { slideItems, progressBarChild } = useSlideItems();
    useAppEffect(() => {
        Object.values(slideItemsToView).forEach((slideItem) => {
            slideItem.showInViewport();
        });
        Object.keys(slideItemsToView).forEach((key) => {
            delete slideItemsToView[key];
        });
    });
    const slideItemThumbnailSize = (
        thumbSizeScale * DEFAULT_THUMBNAIL_SIZE_FACTOR
    );
    return (
        <div className='d-flex flex-wrap justify-content-center'>
            {progressBarChild}
            {slideItems.map((slideItem, i) => {
                return (
                    <SlideItemRenderWrapper key={slideItem.id}
                        draggingIndex={draggingIndex}
                        thumbSize={slideItemThumbnailSize}
                        slideItem={slideItem}
                        index={i}
                        setDraggingIndex={setDraggingIndex}
                    />
                );
            })}
            {Array.from({ length: 2 }, (_, i) => {
                return (
                    <SlideItemGhost key={`${i}`}
                        width={slideItemThumbnailSize}
                    />
                );
            })}
        </div>
    );
}
