import { CSSProperties } from 'react';
import { useContextCC } from '../CanvasController';
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
    const canvasController = useContextCC();
    if (canvasController === null) {
        return null;
    }
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                showCanvasItemContextMenu(e,
                    canvasController, canvasItemBible);
            }}
            onClick={async (e) => {
                e.stopPropagation();
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
    return (
        <div className='w-100 h-100'
            style={CanvasItemBible.genStyle(props)}>
            {props.bibleItemTarget.book}{' '}
            {props.bibleItemTarget.chapter}:{props.bibleItemTarget.startVerse}
            {props.bibleItemTarget.endVerse ? `-${props.bibleItemTarget.endVerse}` : ''}
        </div>
    );
}
