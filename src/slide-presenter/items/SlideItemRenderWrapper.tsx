import { Fragment, useCallback } from 'react';

import SlideItemRender from './SlideItemRender';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import Slide from '../../slide-list/Slide';
import SlideItem from '../../slide-list/SlideItem';
import SlideItemPdfRender from './SlideItemPdfRender';
import {
    handleSlideItemSelecting,
} from './slideItemHelpers';

export default function SlideItemRenderWrapper({
    draggingIndex, slide, thumbSize, slideItem, index, setDraggingIndex,
}: Readonly<{
    draggingIndex: number | null, slide: Slide,
    thumbSize: number, slideItem: SlideItem,
    index: number,
    setDraggingIndex: (index: number | null) => void,
}>) {
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
