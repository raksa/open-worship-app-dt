import { CSSProperties } from 'react';

import CanvasItem from '../CanvasItem';
import CanvasItemImage from '../CanvasItemImage';
import CanvasItemText from '../CanvasItemText';
import BoxEditorNormalViewImageModeComp from
    './BoxEditorNormalViewImageModeComp';
import BoxEditorNormalTextEditModeComp from './BoxEditorNormalTextEditModeComp';
import BoxEditorNormalViewTextModeComp from './BoxEditorNormalViewTextModeComp';
import BoxEditorNormalViewBibleModeComp from
    './BoxEditorNormalViewBibleModeComp';
import CanvasItemBibleItem from '../CanvasItemBibleItem';
import BoxEditorNormalViewErrorComp from './BoxEditorNormalViewErrorComp';
import BoxEditorNormalViewVideoModeComp from
    './BoxEditorNormalViewVideoModeComp';
import CanvasItemVideo from '../CanvasItemVideo';

export default function BoxEditorsNormalModeComp({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const style: CSSProperties = {
        ...canvasItem.getStyle(),
        ...canvasItem.getBoxStyle(),
    };
    switch (canvasItem.type) {
        case 'image':
            return (
                <BoxEditorNormalViewImageModeComp
                    canvasItemImage={
                        canvasItem as CanvasItemImage
                    }
                    style={style}
                />
            );
        case 'video':
            return (
                <BoxEditorNormalViewVideoModeComp
                    canvasItemVideo={
                        canvasItem as CanvasItemVideo
                    }
                    style={style}
                />
            );
        case 'text':
            if (canvasItem.isEditing) {
                return (
                    <BoxEditorNormalTextEditModeComp
                        canvasItemText={canvasItem as CanvasItemText}
                        style={style}
                    />
                );
            }
            return (
                <BoxEditorNormalViewTextModeComp
                    canvasItemText={canvasItem as CanvasItemText}
                    style={style}
                />
            );
        case 'bible':
            return (
                <BoxEditorNormalViewBibleModeComp
                    canvasItemBible={
                        canvasItem as CanvasItemBibleItem
                    }
                    style={style}
                />
            );
        default:
            return (
                <BoxEditorNormalViewErrorComp canvasItem={canvasItem} />
            );
    }
}
