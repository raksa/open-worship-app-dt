import { CSSProperties } from 'react';
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
                canvasItemBible.canvasController?.stopAllMods();
                canvasItemBible.isSelected = true;
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
            {props.bibleItem.book}{' '}
            {props.bibleItem.chapter}:{props.bibleItem.startVerse}
            {props.bibleItem.endVerse ? `-${props.bibleItem.endVerse}` : ''}
        </div>
    );
}
