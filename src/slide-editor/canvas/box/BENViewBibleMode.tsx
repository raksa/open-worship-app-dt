import { CSSProperties } from 'react';
import { canvasController } from '../CanvasController';
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
