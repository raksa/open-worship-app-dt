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

export function genSlideItemHtmlString(slideItem: SlideItem) {
    return reactDomServer.renderToStaticMarkup(
        <SlideItemRenderer slideItem={slideItem} />);
}
export function CanvasItemRenderer({ props }: {
    props: CanvasItemPropsType & { src?: string },
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
