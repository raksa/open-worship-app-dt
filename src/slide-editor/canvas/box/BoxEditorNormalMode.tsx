import { CSSProperties } from 'react';

import CanvasItem from '../CanvasItem';
import CanvasItemImage from '../CanvasItemImage';
import CanvasItemText from '../CanvasItemText';
import BENViewImageMode from './BENViewImageMode';
import BENTextEditMode from './BENTextEditMode';
import BENViewTextMode from './BENViewTextMode';
import BENViewBibleMode from './BENViewBibleMode';
import CanvasItemBibleItem from '../CanvasItemBibleItem';
import BENViewError from './BENViewError';
import BENViewVideoMode from './BENViewVideoMode';
import CanvasItemVideo from '../CanvasItemVideo';
import { useCanvasControllerEvents } from '../canvasEventHelpers';
import { useCanvasControllerContext } from '../CanvasController';

export default function BoxEditorNormalMode({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const canvasController = useCanvasControllerContext();
    const style: CSSProperties = {
        ...canvasItem.getStyle(),
        ...canvasItem.getBoxStyle(),
    };
    useCanvasControllerEvents(canvasController, ['text-edit', 'update']);
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
            if (canvasItem.isEditing) {
                return (
                    <BENTextEditMode
                        canvasItemText={canvasItem as CanvasItemText}
                        style={style} />
                );
            }
            return (
                <BENViewTextMode
                    canvasItemText={canvasItem as CanvasItemText}
                    style={style} />
            );
        case 'bible':
            return (
                <BENViewBibleMode
                    canvasItemBible={
                        canvasItem as CanvasItemBibleItem
                    }
                    style={style} />
            );
        default:
            return <BENViewError
                canvasItem={canvasItem} />;
    }
}
