import { CSSProperties } from 'react';
import {
    showCanvasItemContextMenu,
} from '../canvasCMHelpers';
import CanvasItemVideo, {
    CanvasItemVideoPropsType,
} from '../CanvasItemVideo';
import img404 from '../404.png';
import CanvasController from '../CanvasController';

export default function BENViewVideoMode({
    canvasItemVideo, style,
}: {
    canvasItemVideo: CanvasItemVideo,
    style: CSSProperties
}) {
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                showCanvasItemContextMenu(e, canvasItemVideo);
            }}
            onClick={async (e) => {
                e.stopPropagation();
                const canvasController = CanvasController.getInstance();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(canvasItemVideo, true);
            }}>
            <BENVideoRender props={canvasItemVideo.props} />
        </div>
    );
}

export function BENVideoRender({ props }: {
    props: CanvasItemVideoPropsType,
}) {
    const pWidth = props.width;
    const pHeight = props.height;
    const rWidth = pWidth / props.videoWidth;
    const rHeight = pHeight / props.videoHeight;
    const mR = Math.min(rWidth, rHeight);
    const width = mR * props.videoWidth;
    return (
        <div className='w-100 h-100 d-flex justify-content-center'>
            <img className='align-self-center'
                width={width}
                style={{
                    pointerEvents: 'none',
                }}
                src={props.src || img404} />
        </div>
    );
}
