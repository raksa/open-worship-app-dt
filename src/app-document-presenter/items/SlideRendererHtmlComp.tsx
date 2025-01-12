import { useState } from 'react';

import Slide from '../../app-document-list/Slide';
import SlideRendererComp from './SlideRendererComp';

export default function SlideRendererHtmlComp({
    slide,
}: Readonly<{
    slide: Slide;
}>) {
    const [parentWidth, setParentWidth] = useState(0);
    if (slide.isError) {
        return <div className="alert alert-danger">Error</div>;
    }
    const scale = parentWidth / slide.width;
    return (
        <div
            ref={(div) => {
                if (div !== null) {
                    setParentWidth(div.parentElement?.clientWidth ?? 0);
                }
            }}
            style={{
                width: `${parentWidth}px`,
                height: `${slide.height * scale}px`,
                transform: `scale(${scale},${scale}) translate(50%, 50%)`,
            }}
        >
            <div
                style={{
                    pointerEvents: 'none',
                    width: `${slide.width}px`,
                    height: `${slide.height}px`,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <SlideRendererComp
                    canvasItemsJson={slide.canvasItemsJson}
                    width={`${slide.width}px`}
                    height={`${slide.height}px`}
                />
            </div>
        </div>
    );
}
