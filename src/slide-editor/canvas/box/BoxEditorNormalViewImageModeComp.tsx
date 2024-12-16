import { CSSProperties } from 'react';

import CanvasItemImage from '../CanvasItemImage';
import img404 from '../404.png';
import { useCanvasControllerContext } from '../CanvasController';
import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import { handleError } from '../../../helper/errorHelpers';
import { useCanvasItemContext } from '../CanvasItem';

export default function BoxEditorNormalViewImageModeComp({ style }: Readonly<{
    style: CSSProperties
}>) {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    return (
        <div className='app-box-editor pointer'
            style={style}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showCanvasItemContextMenu(
                    event, canvasController, canvasItem,
                );
            }}
            onClick={async (event) => {
                event.stopPropagation();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(canvasItem, true);
            }}>
            <BoxEditorNormalImageRender />
        </div>
    );
}

export function BoxEditorNormalImageRender() {
    const canvasItem = useCanvasItemContext();
    const { props } = canvasItem;
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
