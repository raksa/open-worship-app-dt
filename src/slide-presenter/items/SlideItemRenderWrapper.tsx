import { Fragment, useCallback } from 'react';

import SlideItemRender from './SlideItemRender';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import { useSelectedSlide } from '../../slide-list/Slide';
import SlideItem, { useSelectedSlideItem } from '../../slide-list/SlideItem';
import SlideItemPdfRender from './SlideItemPdfRender';
import {
    handleSlideItemSelecting,
} from './slideItemHelpers';

export default function SlideItemRenderWrapper({
    draggingIndex, thumbSize, slideItem, index, setDraggingIndex,
}: Readonly<{
    draggingIndex: number | null,
    thumbSize: number, slideItem: SlideItem,
    index: number,
    setDraggingIndex: (index: number | null) => void,
}>) {
    const { selectedSlide } = useSelectedSlide();
    const { setSelectedSlideItem } = useSelectedSlideItem();
    const onDropCallback = useCallback((id: number, isLeft: boolean) => {
        selectedSlide.moveItem(id, index, isLeft);
    }, [selectedSlide, index]);
    const onClickCallback = useCallback((event: any) => {
        handleSlideItemSelecting(setSelectedSlideItem, slideItem, event);
    }, [slideItem]);
    const onContextMenuCallback = useCallback((event: any) => {
        selectedSlide.openContextMenu(event, slideItem);
    }, [selectedSlide, slideItem]);
    const onCopyCallback = useCallback(() => {
        selectedSlide.copiedItem = slideItem;
    }, [selectedSlide, slideItem]);
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
                width={thumbSize} index={index}
            />
        );
    }
    const shouldReceiveAtFirst = (
        draggingIndex !== null && draggingIndex !== 0 && index === 0
    );
    const shouldReceiveAtLast = (
        draggingIndex !== null && draggingIndex !== index &&
        draggingIndex !== index + 1
    );
    return (
        <Fragment key={slideItem.id}>
            {shouldReceiveAtFirst && (
                <SlideItemDragReceiver
                    width={thumbSize}
                    isLeft
                    onDrop={onDropCallback}
                />
            )}
            <SlideItemRender index={index}
                slideItem={slideItem}
                width={thumbSize}
                onClick={onClickCallback}
                onContextMenu={onContextMenuCallback}
                onCopy={onCopyCallback}
                onDragStart={onDragStartCallback}
                onDragEnd={onDragEngCallback}
            />
            {shouldReceiveAtLast && (
                <SlideItemDragReceiver
                    width={thumbSize}
                    onDrop={onDropCallback}
                />
            )}
        </Fragment>
    );
}
