import { useState } from 'react';
import SlideItem from '../../slide-list/SlideItem';
import reactDomServer from 'react-dom/server';
import { CanvasItemPropsType } from '../../slide-editor/canvas/CanvasItem';
import { BENImageRender } from '../../slide-editor/canvas/box/BENViewImageMode';
import { BENTextRender } from '../../slide-editor/canvas/box/BENViewTextMode';
import { BENBibleRender } from '../../slide-editor/canvas/box/BENViewBibleMode';
import CanvasItemImage, { CanvasItemImagePropsType } from '../../slide-editor/canvas/CanvasItemImage';
import FileSource from '../../helper/FileSource';

export function SlideItemIFrame({ slideItem }: {
    slideItem: SlideItem,
}) {
    const styleString = '<style>html,body {overflow: hidden;}</style>';
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

export async function genSlideItemHtmlString(slideItem: SlideItem) {
    for (const canvasItem of slideItem.canvasItemsJson) {
        if (canvasItem.type === 'image' && !canvasItem.props.imageDataUrl) {
            const imgProps = canvasItem.props as CanvasItemImagePropsType;
            const fileSource = FileSource.genFileSource(imgProps.filePath);
            try {
                imgProps.imageDataUrl = await CanvasItemImage.readImageData(fileSource);
            } catch (error) {
                console.log(error);
            }
        }
    }
    return reactDomServer.renderToStaticMarkup(
        <SlideItemRenderer slideItem={slideItem} />);
}
export function CanvasItemRenderer({ props }: {
    props: CanvasItemPropsType,
}) {
    if (props.type === 'image') {
        return (
            <BENImageRender props={props as any} />
        );
    }
    if (props.type === 'text') {
        return (
            <BENTextRender props={props as any} />
        );
    }
    if (props.type === 'bible') {
        return (
            <BENBibleRender props={props as any} />
        );
    }
    return null;
}

export function SlideItemRenderer({ slideItem }: {
    slideItem: SlideItem,
}) {
    return (
        <div style={{
            width: slideItem.width,
            height: slideItem.height,
        }}>
            {slideItem.canvasItemsJson.map((canvasItemJson: any, i) => {
                return (
                    <CanvasItemRenderer key={i}
                        props={canvasItemJson} />
                );
            })}
        </div>
    );
}
