import { useState } from 'react';

import SlideItem from '../../slide-list/SlideItem';
import SlideItemRenderer from './SlideItemRenderer';

export default function SlideItemRendererHtml({ slideItem }: Readonly<{
    slideItem: SlideItem,
}>) {
    const [parentWidth, setParentWidth] = useState(0);
    if (slideItem.isError) {
        return (
            <div className='alert alert-danger'>Error</div>
        );
    }
    const scale = parentWidth / slideItem.width;
    return (
        <div ref={(div) => {
            if (div !== null) {
                setParentWidth(div.parentElement?.clientWidth || 0);
            }
        }}
            style={{
                width: `${parentWidth}px`,
                height: `${slideItem.height * scale}px`,
                transform: `scale(${scale},${scale}) translate(50%, 50%)`,
            }}>
            <div style={{
                pointerEvents: 'none',
                width: `${slideItem.width}px`,
                height: `${slideItem.height}px`,
                transform: 'translate(-50%, -50%)',
            }}>
                <SlideItemRenderer
                    canvasItemsJson={slideItem.canvasItemsJson}
                    width={`${slideItem.width}px`}
                    height={`${slideItem.height}px`}
                />
            </div>
        </div>
    );
}
