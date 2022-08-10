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

const playIconUrl = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
    filter="drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))"
    viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
  </svg>`;
    const blob = new Blob([svg], {
        type: 'image/svg+xml',
    });
    return URL.createObjectURL(blob);
};

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
    const minSize = Math.min(width, pWidth) / 4;
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
        }}>
            <video src={props.src || img404}
                width={width}
                loop muted playsInline />
            <div style={{
                position: 'absolute',
            }}>
                <img width={minSize}
                    src={playIconUrl()} />
            </div>
        </div>
    );
}
