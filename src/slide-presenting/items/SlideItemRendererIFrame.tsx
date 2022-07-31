import { useState } from 'react';
import SlideItem from '../../slide-list/SlideItem';
import { genSlideItemHtmlString } from './SlideItemRenderer';

export default function SlideItemRendererIFrame({ slideItem }: {
    slideItem: SlideItem,
}) {
    if (slideItem.isError) {
        return (
            <div className='alert alert-danger'>Error</div>
        );
    }
    const styleString = `<style>
        html,body {overflow: hidden;}
    </style>`;
    const [parentWidth, setWidth] = useState(0);
    const scale = parentWidth / slideItem.width;
    return (
        <div ref={(div) => {
            if (div !== null) {
                setWidth(div.parentElement?.clientWidth || 0);
            }
        }}
            style={{
                width: parentWidth,
                height: slideItem.height * scale,
                transform: `scale(${scale},${scale}) translate(50%, 50%)`,
            }}>
            <iframe frameBorder='0'
                style={{
                    pointerEvents: 'none',
                    borderStyle: 'none',
                    width: `${slideItem.width}px`,
                    height: `${slideItem.height}px`,
                    transform: 'translate(-50%, -50%)',
                }}
                srcDoc={`${styleString}${genSlideItemHtmlString(slideItem)}`}
            />
        </div>
    );
}
