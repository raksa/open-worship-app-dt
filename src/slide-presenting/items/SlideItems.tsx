import {
    KeyboardType,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemSizing,
} from '../../event/SlideListEventListener';
import { isWindowEditingMode } from '../../App';
import { Fragment, useCallback, useState } from 'react';
import SlideItemRender from './SlideItemRender';
import {
    THUMBNAIL_WIDTH_SETTING_NAME,
    DEFAULT_THUMBNAIL_SIZE,
} from '../../slide-list/slideHelpers';
import SlideItemGhost from './SlideItemGhost';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import Slide from '../../slide-list/Slide';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import PresentSlideManager from '../../_present/PresentSlideManager';
import { genPresentMouseEvent } from '../../_present/presentHelpers';
import SlideItem from '../../slide-list/SlideItem';
import SlideItemPdfRender from './SlideItemPdfRender';

function getPresentingIndex(slide: Slide) {
    for (let i = 0; i < slide.items.length; i++) {
        const selectedList = PresentSlideManager.getDataList(
            slide.fileSource.filePath, slide.items[i].id);
        if (selectedList.length > 0) {
            return i;
        }
    }
    return -1;
}
function handleSlideItemSelecting(slideItem: SlideItem, event: any) {
    if (isWindowEditingMode()) {
        slideItem.isSelected = !slideItem.isSelected;
    } else {
        PresentSlideManager.slideSelect(slideItem.fileSource.filePath,
            slideItem.toJson(), event);
    }
}

function checkSlideItemToView(slide: Slide, element: HTMLElement) {
    if (slide.itemIdShouldToView < 0) {
        return;
    }
    setTimeout(() => {
        const parentElement = element.parentElement as HTMLElement;
        parentElement.scrollTo({
            top: parentElement.scrollHeight,
            behavior: 'smooth',
        });
        slide.itemIdShouldToView = -1;
    }, 0);
}
const genArrowListener = (slide: Slide, slideItems: SlideItem[]) => {
    return (event: KeyboardEvent) => {
        const presentingIndex = getPresentingIndex(slide);
        if (presentingIndex === -1) {
            return;
        }
        const length = slideItems.length;
        if (length) {
            let ind = event.key === 'ArrowLeft' ?
                presentingIndex - 1 : presentingIndex + 1;
            if (ind >= length) {
                ind = 0;
            } else if (ind < 0) {
                ind = length - 1;
            }
            handleSlideItemSelecting(slideItems[ind],
                genPresentMouseEvent() as any);
        }
    };
};
export default function SlideItems({ slide }: { slide: Slide }) {
    const [thumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    useFSEvents(['select', 'edit'], slide.fileSource);
    const slideItems = slide.items;
    if (!isWindowEditingMode()) {
        const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];

        const useCallback = (key: KeyboardType) => {
            useKeyboardRegistering({ key }, genArrowListener(slide, slideItems));
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

function SlideItemRenderWrapper({
    draggingIndex, slide, thumbSize,
    slideItem, index, setDraggingIndex,
}: {
    draggingIndex: number | null, slide: Slide,
    thumbSize: number, slideItem: SlideItem,
    index: number,
    setDraggingIndex: (index: number | null) => void,
}) {
    const onDropCallback = useCallback((id: number, isLeft: boolean) => {
        slide.moveItem(id, index, isLeft);
    }, [slide, index]);
    const onClickCallback = useCallback((event: any) => {
        handleSlideItemSelecting(slideItem, event);
    }, [slideItem]);
    const onContextMenuCallback = useCallback((event: any) => {
        slide.openContextMenu(event, slideItem);
    }, [slide, slideItem]);
    const onCopyCallback = useCallback(() => {
        slide.copiedItem = slideItem;
    }, [slide, slideItem]);
    const onDragStartCallback = useCallback(() => {
        setDraggingIndex(index);
    }, [index, setDraggingIndex]);
    const onDragEngCallback = useCallback(() => {
        setDraggingIndex(null);
    }, [setDraggingIndex]);
    if (slideItem.isPdf) {
        return (
            <SlideItemPdfRender key={slideItem.id}
                onClick={onClickCallback}
                slideItem={slideItem}
                width={thumbSize} index={index} />
        );
    }
    const shouldReceiveAtFirst = draggingIndex !== null &&
        draggingIndex !== 0 && index === 0;
    const shouldReceiveAtLast = draggingIndex !== null &&
        draggingIndex !== index && draggingIndex !== index + 1;
    return (
        <Fragment key={slideItem.id}>
            {shouldReceiveAtFirst && <SlideItemDragReceiver
                width={thumbSize}
                isLeft
                onDrop={onDropCallback} />}
            <SlideItemRender index={index}
                slideItem={slideItem}
                width={thumbSize}
                onClick={onClickCallback}
                onContextMenu={onContextMenuCallback}
                onCopy={onCopyCallback}
                onDragStart={onDragStartCallback}
                onDragEnd={onDragEngCallback} />
            {shouldReceiveAtLast && <SlideItemDragReceiver
                width={thumbSize}
                onDrop={onDropCallback} />}
        </Fragment>
    );
}
