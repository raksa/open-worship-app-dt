import { CSSProperties } from 'react';
import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import CanvasController from '../CanvasController';
import CanvasItemBibleItem, {
    CanvasItemBiblePropsType,
} from '../CanvasItemBibleItem';
import { BENViewErrorRender } from './BENViewError';

export default function BENViewBibleMode({
    canvasItemBible, style,
}: {
    canvasItemBible: CanvasItemBibleItem,
    style: CSSProperties
}) {
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showCanvasItemContextMenu(event, canvasItemBible);
            }}
            onClick={async (event) => {
                event.stopPropagation();
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
    try {
        CanvasItemBibleItem.validate(props);
    } catch (error) {
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
