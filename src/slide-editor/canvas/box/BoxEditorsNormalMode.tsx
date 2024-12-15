import { CSSProperties } from 'react';

import CanvasItem from '../CanvasItem';
import CanvasItemImage from '../CanvasItemImage';
import CanvasItemText from '../CanvasItemText';
import BENViewImageMode from './BoxEditorNormalViewImageMode';
import BoxEditorNormalTextEditMode from './BoxEditorNormalTextEditMode';
import BoxEditorNormalViewTextMode from './BoxEditorNormalViewTextMode';
import BoxEditorNormalViewBibleMode from './BoxEditorNormalViewBibleMode';
import CanvasItemBibleItem from '../CanvasItemBibleItem';
import BoxEditorNormalViewError from './BoxEditorNormalViewError';
import BoxEditorNormalViewVideoMode from './BoxEditorNormalViewVideoMode';
import CanvasItemVideo from '../CanvasItemVideo';

export default function BoxEditorsNormalMode({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const style: CSSProperties = {
        ...canvasItem.getStyle(),
        ...canvasItem.getBoxStyle(),
    };
    switch (canvasItem.type) {
        case 'image':
            return (
                <BENViewImageMode
                    canvasItemImage={
                        canvasItem as CanvasItemImage
                    }
                    style={style}
                />
            );
        case 'video':
            return (
                <BoxEditorNormalViewVideoMode
                    canvasItemVideo={
                        canvasItem as CanvasItemVideo
                    }
                    style={style}
                />
            );
        case 'text':
            if (canvasItem.isEditing) {
                return (
                    <BoxEditorNormalTextEditMode
                        canvasItemText={canvasItem as CanvasItemText}
                        style={style}
                    />
                );
            }
            return (
                <BoxEditorNormalViewTextMode
                    canvasItemText={canvasItem as CanvasItemText}
                    style={style}
                />
            );
        case 'bible':
            return (
                <BoxEditorNormalViewBibleMode
                    canvasItemBible={
                        canvasItem as CanvasItemBibleItem
                    }
                    style={style}
                />
            );
        default:
            return (
                <BoxEditorNormalViewError canvasItem={canvasItem} />
            );
    }
}
