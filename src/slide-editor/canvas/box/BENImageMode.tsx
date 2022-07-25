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
    let width = canvasItemImage.imageWidth;
    if (pWidth < canvasItemImage.imageWidth ||
        pHeight < canvasItemImage.imageHeight) {
        const rWidth = pWidth / canvasItemImage.imageWidth;
        const rHeight = pHeight / canvasItemImage.imageHeight;
        const mR = Math.min(rWidth, rHeight);
        width = mR * canvasItemImage.imageWidth;
    }
    return (
        <img width={width}
            src={src || img404} onError={() => {
                setSrc(img404);
            }} />
    );
}
