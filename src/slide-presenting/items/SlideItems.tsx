import { useState } from 'react';
import {
    KeyboardType, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useSlideItemSizing } from '../../event/SlideListEventListener';
import {
    THUMBNAIL_WIDTH_SETTING_NAME, DEFAULT_THUMBNAIL_SIZE,
} from '../../slide-list/slideHelpers';
import SlideItemGhost from './SlideItemGhost';
import Slide from '../../slide-list/Slide';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import { useWindowIsEditingMode } from '../../router/routeHelpers';
import { genArrowListener, checkSlideItemToView } from './slideItemHelpers';
import SlideItemRenderWrapper from './SlideItemRenderWrapper';

export default function SlideItems({ slide }: Readonly<{ slide: Slide }>) {
    const [thumbSize] = useSlideItemSizing(
        THUMBNAIL_WIDTH_SETTING_NAME, DEFAULT_THUMBNAIL_SIZE
    );
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const isEditingMode = useWindowIsEditingMode();
    useFSEvents(['select', 'edit'], slide.filePath);
    const slideItems = slide.items;
    if (!isEditingMode) {
        const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];

        const useCallback = (key: KeyboardType) => {
            useKeyboardRegistering(
                [{ key }], genArrowListener(slide, slideItems),
            );
        };
        arrows.forEach(useCallback);
    }
    return (
        <div className='d-flex flex-wrap justify-content-center'
            ref={(element) => {
                if (element) {
                    checkSlideItemToView(slide, element);
                }
            }}>
            {slideItems.map((slideItem, i) => {
                return (
                    <SlideItemRenderWrapper key={slideItem.id}
                        draggingIndex={draggingIndex}
                        slide={slide} thumbSize={thumbSize}
                        slideItem={slideItem} index={i}
                        setDraggingIndex={setDraggingIndex} />
                );
            })}
            {Array.from({ length: 2 }, (_, i) => {
                return (
                    <SlideItemGhost key={`${i}`}
                        width={thumbSize} />
                );
            })}
        </div>
    );
}
