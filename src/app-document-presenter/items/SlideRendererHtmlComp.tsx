import Slide from '../../app-document-list/Slide';
import SlideRendererComp from './SlideRendererComp';
import { useScale } from './SlideItemRenderComp';

export default function SlideRendererHtmlComp({
    slide,
}: Readonly<{
    slide: Slide;
}>) {
    const { scale, parentWidth, setParentDiv } = useScale(slide);
    if (slide.isError) {
        return <div className="alert alert-danger">Error</div>;
    }
    return (
        <div
            ref={setParentDiv}
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
