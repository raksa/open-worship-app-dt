import { CanvasDimType } from '../../slide-editor/canvas/Canvas';

export default function SlideItemIFrame({
    id, width, canvasDim,
}: {
    id: number, width: number,
    canvasDim: CanvasDimType,
}) {
    const height = width * canvasDim.height / canvasDim.width;
    const scaleX = width / canvasDim.width;
    const scaleY = height / canvasDim.height;
    return (
        <div style={{
            width, height,
            transform: `scale(${scaleX},${scaleY}) translate(50%, 50%)`,
        }}>
            <iframe title={id + ''}
                frameBorder='0'
                style={{
                    pointerEvents: 'none',
                    borderStyle: 'none',
                    width: `${canvasDim.width}px`,
                    height: `${canvasDim.height}px`,
                    transform: 'translate(-50%, -50%)',
                }}
                srcDoc={`<style>html,body {overflow: hidden;}</style>${canvasDim.htmlString}`}
            />
        </div>
    );
}
