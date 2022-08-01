import { CSSProperties } from 'react';
import CanvasController from '../CanvasController';
import {
    showCanvasItemContextMenu,
} from '../canvasHelpers';
import CanvasItemBible, {
    CanvasItemBiblePropsType,
} from '../CanvasItemBible';

export default function BENViewBibleMode({
    canvasItemBible, style,
}: {
    canvasItemBible: CanvasItemBible,
    style: CSSProperties
}) {
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                showCanvasItemContextMenu(e, canvasItemBible);
            }}
            onClick={async (e) => {
                e.stopPropagation();
                const canvasController = CanvasController.getInstance();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(
                    canvasItemBible, true);
            }}>
            <BENBibleRender props={canvasItemBible.props} />
        </div>
    );
}

export function BENBibleRender({ props }: {
    props: CanvasItemBiblePropsType,
}) {
    const bibleRenderedList = props.bibleRenderedList;
    return (
        <div className='w-100 h-100'
            style={CanvasItemBible.genStyle(props)}>
            {bibleRenderedList.map((bibleRendered, i) => {
                return (
                    <div key={i}>
                        <div>{bibleRendered.title}</div>
                        <div>{bibleRendered.text}</div>
                    </div>
                );
            })}
        </div>
    );
}
