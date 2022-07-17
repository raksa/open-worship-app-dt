import { useState } from 'react';
import { CanvasDimType } from '../../slide-editor/canvas/Canvas';

export default function SlideItemIFrame({ canvasDim }: {
    canvasDim: CanvasDimType
}) {
    const styleString = '<style>html,body {overflow: hidden;}</style>';
    const [parentWidth, setWidth] = useState(0);
    const scale = parentWidth / canvasDim.width;
    return (
        <div ref={(div) => {
            if (div !== null) {
                setWidth(div.parentElement?.clientWidth || 0);
            }
        }}
            style={{
                width: parentWidth,
                height: canvasDim.height * scale,
                transform: `scale(${scale},${scale}) translate(50%, 50%)`,
            }}>
            <iframe frameBorder='0'
                style={{
                    pointerEvents: 'none',
                    borderStyle: 'none',
                    width: `${canvasDim.width}px`,
                    height: `${canvasDim.height}px`,
                    transform: 'translate(-50%, -50%)',
                }}
                srcDoc={`${styleString}${canvasDim.htmlString}`}
            />
        </div>
    );
}
