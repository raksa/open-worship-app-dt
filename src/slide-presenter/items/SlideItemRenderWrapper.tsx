import { Fragment } from 'react';

import SlideItemRenderComp from './SlideItemRenderComp';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import { useSelectedSlideContext } from '../../slide-list/Slide';
import SlideItem, {
    useSelectedEditingSlideItemSetterContext,
} from '../../slide-list/SlideItem';
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
    const selectedSlide = useSelectedSlideContext();
    const setSelectedSlideItem = useSelectedEditingSlideItemSetterContext();
    const handleDropping = (id: number, isLeft: boolean) => {
        selectedSlide.moveItem(id, index, isLeft);
    };
    const handleClicking = (event: any) => {
        handleSlideItemSelecting(setSelectedSlideItem, slideItem, event);
    };
    const handleContextMenuOpening = (event: any) => {
        selectedSlide.openContextMenu(event, slideItem);
    };
    const handleCopying = () => {
        selectedSlide.copiedItem = slideItem;
    };
    const handleDragStarting = () => {
        setDraggingIndex(index);
    };
    const handleDragEnding = () => {
        setDraggingIndex(null);
    };
    if (slideItem.isPdf) {
        return (
            <SlideItemPdfRender key={slideItem.id}
                onClick={handleClicking}
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
                    onDrop={handleDropping}
                />
            )}
            <SlideItemRenderComp index={index}
                slideItem={slideItem}
                width={thumbSize}
                onClick={handleClicking}
                onContextMenu={handleContextMenuOpening}
                onCopy={handleCopying}
                onDragStart={handleDragStarting}
                onDragEnd={handleDragEnding}
            />
            {shouldReceiveAtLast && (
                <SlideItemDragReceiver
                    width={thumbSize}
                    onDrop={handleDropping}
                />
            )}
        </Fragment>
    );
}
