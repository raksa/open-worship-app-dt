import { CSSProperties } from 'react';

import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import CanvasItemBibleItem, {
    CanvasItemBiblePropsType,
} from '../CanvasItemBibleItem';
import { BENViewErrorRender } from './BENViewError';
import { handleError } from '../../../helper/errorHelpers';

export default function BENViewBibleMode({
    canvasItemBible, style,
}: Readonly<{
    canvasItemBible: CanvasItemBibleItem,
    style: CSSProperties
}>) {
    const canvasController = useCanvasControllerContext();
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showCanvasItemContextMenu(
                    event, canvasController, canvasItemBible,
                );
            }}
            onClick={async (event) => {
                event.stopPropagation();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(
                    canvasItemBible, true);
            }}>
            <BENBibleRender props={canvasItemBible.props} />
        </div>
    );
}

export function BENBibleRender({ props }: Readonly<{
    props: CanvasItemBiblePropsType,
}>) {
    try {
        CanvasItemBibleItem.validate(props);
    } catch (error) {
        handleError(error);
        return (
            <BENViewErrorRender />
        );
    }
    const bibleRenderedList = props.bibleRenderedList;
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
