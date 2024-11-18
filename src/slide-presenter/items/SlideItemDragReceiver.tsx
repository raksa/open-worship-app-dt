import './SlideItemDragReceiver.scss';

import { CSSProperties, useState } from 'react';

import SlideItem from '../../slide-list/SlideItem';
import { handleDrop } from '../../bible-list/dragHelpers';
import { DragTypeEnum } from '../../helper/DragInf';

export default function SlideItemDragReceiver({
    width, onDrop, isLeft,
}: Readonly<{
    width: number, isLeft?: boolean,
    onDrop: (id: number, isLeft: boolean) => void,
}>) {
    const [isVertical, setIsVertical] = useState(false);
    const style: CSSProperties = isVertical ? {
        width: `${width}px`,
        height: '20px',
    } : {
        width: '20px',
    };
    return (
        <div className='slide-item-drag-receiver'
            style={style}
            ref={(div) => {
                if (div) {
                    const childrenElements = div.parentElement?.
                        querySelectorAll('.slide-item');
                    const children = Array.from(childrenElements || []);
                    const getLeft = (element: Element) => {
                        return element.getBoundingClientRect().left;
                    };
                    const isVertical = children.length > 1 &&
                        getLeft(children[1]) - getLeft(children[0]) < width;
                    setIsVertical(isVertical);
                }
            }}
            onDragOver={(event) => {
                event.preventDefault();
                (event.currentTarget as HTMLDivElement).style.opacity = '0.5';
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                (event.currentTarget as HTMLDivElement).style.opacity = '0.1';
            }}
            onDrop={async (event) => {
                const droppedData = await handleDrop(event);
                if (droppedData === null ||
                    droppedData.type !== DragTypeEnum.SLIDE_ITEM) {
                    return;
                }
                onDrop((droppedData.item as SlideItem).id, !!isLeft);
            }} />
    );
}
