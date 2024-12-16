import { CSSProperties } from 'react';

import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import CanvasItemBibleItem, {
    CanvasItemBiblePropsType,
} from '../CanvasItemBibleItem';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import { handleError } from '../../../helper/errorHelpers';
import { useCanvasItemContext } from '../CanvasItem';

export default function BoxEditorNormalViewBibleModeComp({ style }: Readonly<{
    style: CSSProperties
}>) {
    const canvasItem = useCanvasItemContext();
    const canvasController = useCanvasControllerContext();
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
                canvasController.setItemIsSelecting(
                    canvasItem, true,
                );
            }}>
            <BoxEditorNormalBibleRender />
        </div>
    );
}

export function BoxEditorNormalBibleRender() {
    const canvasItem = useCanvasItemContext();
    const { props } = canvasItem;
    try {
        CanvasItemBibleItem.validate(props);
    } catch (error) {
        handleError(error);
        return (
            <BENViewErrorRender />
        );
    }
    const bibleRenderedList = (
        (props as CanvasItemBiblePropsType).bibleRenderedList
    );
    return (
        <div className='w-100 h-100'
            style={CanvasItemBibleItem.genStyle(props)}>
            {bibleRenderedList.map((bibleRendered) => {
                return (
                    <div key={bibleRendered.title}>
                        <div>{bibleRendered.title}</div>
                        <div>{bibleRendered.text}</div>
                    </div>
                );
            })}
        </div>
    );
}
