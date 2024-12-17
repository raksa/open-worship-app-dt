import { useOptimistic, useState } from 'react';

import {
    KeyboardType, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItemGhost from './SlideItemGhost';
import { useSelectedSlideContext } from '../../slide-list/Slide';
import { genArrowListener } from './slideItemHelpers';
import SlideItemRenderWrapper from './SlideItemRenderWrapper';
import { DEFAULT_THUMBNAIL_SIZE_FACTOR } from '../../slide-list/slideHelpers';
import SlideItem, {
    useSelectedEditingSlideItemSetterContext,
} from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';
import { useAppEffect } from '../../helper/debuggerHelpers';
import { useProgressBarComp } from '../../progress-bar/ProgressBarComp';
import { useFileSourceEvents } from '../../helper/dirSourceHelpers';

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
        ['edit'], (editingSlideItem: any) => {
            if (!(editingSlideItem instanceof SlideItem)) {
                return;
            }
            // clear the slideItemsToView
            const newSlideItems = slideItems.map((item) => {
                if (item.checkIsSame(editingSlideItem)) {
                    return editingSlideItem;
                } else {
                    return item;
                }
            });
            setSlideItems1(newSlideItems);
        }, [slideItems], selectedSlide.filePath
    );
    useFileSourceEvents(['update'], () => {
        setSlideItems1(selectedSlide.items);
    }, [selectedSlide], selectedSlide.filePath);
    useFileSourceEvents(['delete'], () => {
        setSlideItems1(selectedSlide.items);
    }, [selectedSlide], selectedSlide.filePath);
    useFileSourceEvents(['edit'], (newSlideItem: SlideItem) => {
        const newSlideItems = slideItems.map((slideItem) => {
            if (slideItem.checkIsSame(newSlideItem)) {
                return newSlideItem;
            }
            return slideItem;
        });
        setSlideItems1(newSlideItems);
    }, [slideItems], selectedSlide.filePath);
    useFileSourceEvents(['new'], (newSlideItem: SlideItem) => {
        const newSlideItems = selectedSlide.items.map((slideItem) => {
            if (slideItem.checkIsSame(newSlideItem)) {
                slideItemsToView[newSlideItem.id] = newSlideItem;
                return newSlideItem;
            } else {
                return slideItem;
            }
        });
        setSlideItems1(newSlideItems);
    }, [selectedSlide], selectedSlide.filePath);
    const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];
    const arrowListener = (
        appProvider.isPageEditor ? () => { } :
            genArrowListener(setSelectedSlideItem, selectedSlide, slideItems)
    );
    useKeyboardRegistering(arrows.map((key) => {
        return { key };
    }), arrowListener);
    useAppEffect(() => {
        const slideItems = Object.values(slideItemsToView);
        if (slideItems.length === 0) {
            return;
        }
        slideItems.forEach((slideItem) => {
            slideItem.showInViewport();
        });
        Object.keys(slideItemsToView).forEach((key) => {
            delete slideItemsToView[key];
        });
    });
    return { slideItems, progressBarChild };
}

export default function SlideItemsComp() {
    const [thumbSizeScale] = useSlideItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { slideItems, progressBarChild } = useSlideItems();
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
