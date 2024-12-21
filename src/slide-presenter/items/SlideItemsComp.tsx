import { useState } from 'react';

import {
    KeyboardType, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItemGhost from './SlideItemGhost';
import Slide, { useSelectedSlideContext } from '../../slide-list/Slide';
import { genArrowListener } from './slideItemHelpers';
import SlideItemRenderWrapper from './SlideItemRenderWrapper';
import { DEFAULT_THUMBNAIL_SIZE_FACTOR } from '../../slide-list/slideHelpers';
import SlideItem, {
    useSelectedEditingSlideItemSetterContext,
} from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';
import { useAppEffect, useAppEffectAsync } from '../../helper/debuggerHelpers';
import { useFileSourceEvents } from '../../helper/dirSourceHelpers';
import { getPdfInfo } from '../../helper/pdfHelpers';

async function getSlideItems(slide: Slide) {
    if (!slide.isPdf) {
        return slide.items;
    }
    const pdfInfo = await getPdfInfo(slide.filePath);
    if (pdfInfo === null) {
        return [];
    }
    const { page } = pdfInfo;
    return Array.from({ length: page.count }).fill(0).map((_, i) => {
        const slideItem = new SlideItem(i, slide.filePath, {
            id: i, canvasItems: [],
            isPdf: true,
            filePath: slide.filePath,
            pdfPageNumber: i,
            metadata: {
                width: page.width, height: page.height,
            },
        });
        return slideItem;
    });
}

const slideItemsToView: { [key: string]: SlideItem } = {};
function useSlideItems() {
    const selectedSlide = useSelectedSlideContext();
    const setSelectedSlideItem = useSelectedEditingSlideItemSetterContext();
    const [slideItems, setSlideItems] = useState<SlideItem[]>([]);
    useAppEffectAsync(async (methodContext) => {
        const newSlideItems = await getSlideItems(selectedSlide);
        methodContext.setSlideItems(newSlideItems);
    }, [selectedSlide], { setSlideItems });
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
            setSlideItems(newSlideItems);
        }, [slideItems], selectedSlide.filePath
    );
    useFileSourceEvents(['update'], async () => {
        const newSlideItems = await getSlideItems(selectedSlide);
        setSlideItems(newSlideItems);
    }, [selectedSlide], selectedSlide.filePath);
    useFileSourceEvents(['delete'], async () => {
        const newSlideItems = await getSlideItems(selectedSlide);
        setSlideItems(newSlideItems);
    }, [selectedSlide], selectedSlide.filePath);
    useFileSourceEvents(['edit'], (newSlideItem: SlideItem) => {
        const newSlideItems = slideItems.map((slideItem) => {
            if (slideItem.checkIsSame(newSlideItem)) {
                return newSlideItem;
            }
            return slideItem;
        });
        setSlideItems(newSlideItems);
    }, [slideItems], selectedSlide.filePath);
    useFileSourceEvents(['new'], async (newSlideItem: SlideItem) => {
        let newSlideItems = await getSlideItems(selectedSlide);
        newSlideItems = newSlideItems.map((slideItem) => {
            if (slideItem.checkIsSame(newSlideItem)) {
                slideItemsToView[newSlideItem.id] = newSlideItem;
                return newSlideItem;
            } else {
                return slideItem;
            }
        });
        setSlideItems(newSlideItems);
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
    return { slideItems };
}

export default function SlideItemsComp() {
    const [thumbSizeScale] = useSlideItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { slideItems } = useSlideItems();
    const slideItemThumbnailSize = (
        thumbSizeScale * DEFAULT_THUMBNAIL_SIZE_FACTOR
    );
    return (
        <div className='d-flex flex-wrap justify-content-center'>
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
