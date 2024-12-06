import { useState } from 'react';

import {
    KeyboardType, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItemGhost from './SlideItemGhost';
import { useSelectedSlide } from '../../slide-list/Slide';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import { useWindowIsEditorMode } from '../../router/routeHelpers';
import { genArrowListener, checkSlideItemToView } from './slideItemHelpers';
import SlideItemRenderWrapper from './SlideItemRenderWrapper';
import { DEFAULT_THUMBNAIL_SIZE_FACTOR } from '../../slide-list/slideHelpers';
import { useSelectedSlideItem } from '../../slide-list/SlideItem';

export default function SlideItems() {
    const { selectedSlide } = useSelectedSlide();
    const { setSelectedSlideItem } = useSelectedSlideItem();
    const [thumbSizeScale] = useSlideItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const isEditorMode = useWindowIsEditorMode();
    useFSEvents(['select', 'edit'], selectedSlide.filePath);
    const slideItems = selectedSlide.items;
    const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];
    const arrowListener = (
        isEditorMode ? () => { } :
            genArrowListener(setSelectedSlideItem, selectedSlide, slideItems)
    );
    useKeyboardRegistering(arrows.map((key) => {
        return { key };
    }), arrowListener);
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
