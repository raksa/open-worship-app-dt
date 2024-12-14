import { useState } from 'react';

import {
    KeyboardType, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItemGhost from './SlideItemGhost';
import { useSelectedSlideContext } from '../../slide-list/Slide';
import { useFileSourceEvents } from '../../helper/dirSourceHelpers';
import { genArrowListener, checkSlideItemToView } from './slideItemHelpers';
import SlideItemRenderWrapper from './SlideItemRenderWrapper';
import { DEFAULT_THUMBNAIL_SIZE_FACTOR } from '../../slide-list/slideHelpers';
import SlideItem, {
    useSelectedEditingSlideItemSetterContext,
} from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';

function useSlideItems() {
    const selectedSlide = useSelectedSlideContext();
    const setSelectedSlideItem = useSelectedEditingSlideItemSetterContext();
    const [slideItems, setSlideItems] = useState<SlideItem[]>(
        selectedSlide.items,
    );
    useFileSourceEvents(['select', 'edit'], selectedSlide.filePath);
    useFileSourceEvents(
        ['update', 'edit'], selectedSlide.filePath,
        (updatedSlideItem: SlideItem) => {
            debugger;
            const newSlideItems = selectedSlide.items.map((item, i) => {
                if (item.checkIsSame(updatedSlideItem)) {
                    return updatedSlideItem;
                }
                if (slideItems[i].checkIsSame(item)) {
                    return slideItems[i];
                } else {
                    return item;
                }
            });
            setSlideItems(newSlideItems);
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
    return { slideItems, selectedSlide };
}

export default function SlideItems() {
    const [thumbSizeScale] = useSlideItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { slideItems, selectedSlide } = useSlideItems();
    const slideItemThumbnailSize = (
        thumbSizeScale * DEFAULT_THUMBNAIL_SIZE_FACTOR
    );
    return (
        <div className='d-flex flex-wrap justify-content-center'
            ref={(element) => {
                if (element) {
                    checkSlideItemToView(selectedSlide, element);
                }
            }}>
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
