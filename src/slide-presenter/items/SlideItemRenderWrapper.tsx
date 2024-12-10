import { Fragment } from 'react';

import SlideItemRender from './SlideItemRender';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import { useSelectedSlideContext } from '../../slide-list/Slide';
import SlideItem, {
    useSelectedSlideItemContext,
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
    const { selectedSlide } = useSelectedSlideContext();
    const { setSelectedSlideItem } = useSelectedSlideItemContext();
    const handleDrop = (id: number, isLeft: boolean) => {
        selectedSlide.moveItem(id, index, isLeft);
    };
    const handleClick = (event: any) => {
        handleSlideItemSelecting(setSelectedSlideItem, slideItem, event);
    };
    const handleContextMenu = (event: any) => {
        selectedSlide.openContextMenu(event, slideItem);
    };
    const handleCopy = () => {
        selectedSlide.copiedItem = slideItem;
    };
    const handleDragStart = () => {
        setDraggingIndex(index);
    };
    const handleDragEng = () => {
        setDraggingIndex(null);
    };
    if (slideItem.isPdf) {
        return (
            <SlideItemPdfRender key={slideItem.id}
                onClick={handleClick}
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
                    onDrop={handleDrop}
                />
            )}
            <SlideItemRender index={index}
                slideItem={slideItem}
                width={thumbSize}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onCopy={handleCopy}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEng}
            />
            {shouldReceiveAtLast && (
                <SlideItemDragReceiver
                    width={thumbSize}
                    onDrop={handleDrop}
                />
            )}
        </Fragment>
    );
}
