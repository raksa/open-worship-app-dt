import { CSSProperties } from 'react';

import CanvasItemImage, {
    CanvasItemImagePropsType,
} from '../CanvasItemImage';
import img404 from '../404.png';
import { useCanvasControllerContext } from '../CanvasController';
import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import { BENViewErrorRender } from './BoxEditorNormalViewError';
import { handleError } from '../../../helper/errorHelpers';

export default function BENViewImageMode({
    canvasItemImage, style,
}: Readonly<{
    canvasItemImage: CanvasItemImage,
    style: CSSProperties
}>) {
    const canvasController = useCanvasControllerContext();
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showCanvasItemContextMenu(
                    event, canvasController, canvasItemImage,
                );
            }}
            onClick={async (event) => {
                event.stopPropagation();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(canvasItemImage, true);
            }}>
            <BoxEditorNormalImageRender props={canvasItemImage.props} />
        </div>
    );
}

export function BoxEditorNormalImageRender({ props }: Readonly<{
    props: CanvasItemImagePropsType,
}>) {
    try {
        CanvasItemImage.validate(props);
    } catch (error) {
        handleError(error);
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
            <img alt='' className='align-self-center'
                width={width}
                style={{
                    pointerEvents: 'none',
                }}
                src={props.srcData || img404}
            />
        </div>
    );
}
