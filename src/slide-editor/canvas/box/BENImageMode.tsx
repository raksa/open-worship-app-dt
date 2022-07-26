import { CSSProperties, useState } from 'react';
import {
    showCanvasItemContextMenu,
} from '../canvasHelpers';
import CanvasItemImage from '../CanvasItemImage';
import img404 from '../404.png';

export default function BENImageMode({
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
                canvasItemImage.canvasController?.stopAllMods();
                canvasItemImage.isSelected = true;
            }}>
            <BENImageRender canvasItemImage={canvasItemImage} />
        </div>
    );
}

export function BENImageRender({ canvasItemImage }: {
    canvasItemImage: CanvasItemImage,
}) {
    const [src, setSrc] = useState(canvasItemImage.props.fileSource?.src || null);

    const pWidth = canvasItemImage.props.width;
    const pHeight = canvasItemImage.props.height;
    const rWidth = pWidth / canvasItemImage.imageWidth;
    const rHeight = pHeight / canvasItemImage.imageHeight;
    const mR = Math.min(rWidth, rHeight);
    const width = mR * canvasItemImage.imageWidth;
    return (
        <div className='w-100 h-100 d-flex justify-content-center'>
            <img className='align-self-center'
                width={width}
                style={{
                    pointerEvents: 'none',
                }}
                src={src || img404} onError={() => {
                    setSrc(img404);
                }} />
        </div>
    );
}
