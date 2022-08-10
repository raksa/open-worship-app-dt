import { CSSProperties } from 'react';
import {
    showCanvasItemContextMenu,
} from '../canvasCMHelpers';
import CanvasItemVideo, {
    CanvasItemVideoPropsType,
} from '../CanvasItemVideo';
import img404 from '../404.png';
import CanvasController from '../CanvasController';
import { BENViewErrorRender } from './BENViewError';

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
    try {
        CanvasItemVideo.validate(props);
    } catch (error) {
        return (
            <BENViewErrorRender />
        );
    }
    const pWidth = props.width;
    const pHeight = props.height;
    const rWidth = pWidth / props.mediaWidth;
    const rHeight = pHeight / props.mediaHeight;
    const mR = Math.min(rWidth, rHeight);
    const width = mR * props.mediaWidth;
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <video src={props.src || img404}
                width={width}
                style={{
                    pointerEvents: 'none',
                }} loop muted playsInline />
        </div>
    );
}
