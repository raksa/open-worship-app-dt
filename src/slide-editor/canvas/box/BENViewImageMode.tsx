import { CSSProperties } from 'react';
import CanvasItemImage, {
    CanvasItemImagePropsType,
} from '../CanvasItemImage';
import img404 from '../404.png';
import CanvasController from '../CanvasController';
import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import { BENViewErrorRender } from './BENViewError';

export default function BENViewImageMode({
    canvasItemImage, style,
}: {
    canvasItemImage: CanvasItemImage,
    style: CSSProperties
}) {
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                showCanvasItemContextMenu(e, canvasItemImage);
            }}
            onClick={async (e) => {
                e.stopPropagation();
                const canvasController = CanvasController.getInstance();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(canvasItemImage, true);
            }}>
            <BENImageRender props={canvasItemImage.props} />
        </div>
    );
}

export function BENImageRender({ props }: {
    props: CanvasItemImagePropsType,
}) {
    try {
        CanvasItemImage.validate(props);
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
            <img className='align-self-center'
                width={width}
                style={{
                    pointerEvents: 'none',
                }}
                src={props.src || img404} />
        </div>
    );
}
