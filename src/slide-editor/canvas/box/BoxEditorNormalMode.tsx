import { CSSProperties } from 'react';
import CanvasItem from '../CanvasItem';
import CanvasItemImage from '../CanvasItemImage';
import CanvasItemText from '../CanvasItemText';
import BENViewImageMode from './BENViewImageMode';
import BENTextEditMode from './BENTextEditMode';
import BENViewTextMode from './BENViewTextMode';
import BENViewBibleMode from './BENViewBibleMode';
import CanvasItemBible from '../CanvasItemBible';
import BENViewError from './BENViewError';
import BENViewVideoMode from './BENViewVideoMode';
import CanvasItemVideo from '../CanvasItemVideo';
import { useCCEvents } from '../canvasEventHelpers';

export default function BoxEditorNormalMode({
    canvasItem,
}: {
    canvasItem: CanvasItem<any>,
}) {
    const style: CSSProperties = {
        ...canvasItem.getStyle(),
        ...canvasItem.getBoxStyle(),
    };
    useCCEvents(['text-edit', 'update']);
    switch (canvasItem.type) {
        case 'image':
            return (
                <BENViewImageMode
                    canvasItemImage={
                        canvasItem as CanvasItemImage
                    }
                    style={style} />
            );
        case 'video':
            return (
                <BENViewVideoMode
                    canvasItemVideo={
                        canvasItem as CanvasItemVideo
                    }
                    style={style} />
            );
        case 'text':
            const canvasItemText = canvasItem as CanvasItemText;
            if (canvasItem.isEditing) {
                return (
                    <BENTextEditMode
                        canvasItemText={canvasItemText}
                        style={style} />
                );
            }
            return (
                <BENViewTextMode
                    canvasItemText={canvasItemText}
                    style={style} />
            );
        case 'bible':
            return (
                <BENViewBibleMode
                    canvasItemBible={
                        canvasItem as CanvasItemBible
                    }
                    style={style} />
            );
        default:
            return <BENViewError
                canvasItem={canvasItem} />;
    }
}
