import { CSSProperties } from 'react';
import {
    showCanvasItemContextMenu,
} from '../canvasHelpers';
import CanvasItemImage, {
    CanvasItemImagePropsType,
} from '../CanvasItemImage';
import img404 from '../404.png';
import { canvasController } from '../CanvasController';

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
    const pWidth = props.width;
    const pHeight = props.height;
    const rWidth = pWidth / props.imageWidth;
    const rHeight = pHeight / props.imageHeight;
    const mR = Math.min(rWidth, rHeight);
    const width = mR * props.imageWidth;
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