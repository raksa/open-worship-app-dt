import './SlideItemDragReceiver.scss';

import { CSSProperties, useState } from 'react';
import PresentSlideManager from '../../_present/PresentSlideManager';

export default function SlideItemDragReceiver({ width, onDrop }: {
    width: number, onDrop: (id: number) => void,
}) {
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
                    const childrenElements = div.parentElement?.querySelectorAll('.slide-item');
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
            onDrop={(event) => {
                const dragDataString = event.dataTransfer.getData('text');
                const { slideItemId } = PresentSlideManager
                    .deserializeDragData(dragDataString);
                onDrop(slideItemId);
            }} />
    );
}
