import './SlideItemDragReceiver.scss';

import SlideItem from '../../slide-list/SlideItem';
import { CSSProperties, useState } from 'react';

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
                const path = event.dataTransfer.getData('text');
                const result = SlideItem.extractItemSetting(path);
                if (result !== null) {
                    onDrop(result.id);
                }
            }}></div>
    );
}
