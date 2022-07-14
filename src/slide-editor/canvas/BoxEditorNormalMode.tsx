import { CSSProperties, useEffect, useState } from 'react';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';
import { showBoxContextMenu, useCCRefresh } from './canvasHelpers';
import BoxEditorRenderText from './BoxEditorRenderText';

export default function BoxEditorNormalMode({
    canvasItem, canvasController,
}: {
    canvasItem: CanvasItem,
    canvasController: CanvasController,
}) {
    const style: CSSProperties = {
        ...canvasItem.style,
        ...canvasItem.normalStyle,
    };
    useCCRefresh(canvasController, ['start-editing']);
    return (
        <div className={`box-editor pointer ${canvasItem.isEditing ? 'editable' : ''}`}
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                if (canvasItem.isEditing) {
                    canvasItem.isEditing = false;
                } else {
                    showBoxContextMenu(e, canvasController, canvasItem);
                }
            }}
            onKeyUp={(e) => {
                if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
                    canvasItem.isEditing = false;
                }
            }}
            onClick={async (e) => {
                e.stopPropagation();
                if (canvasItem.isEditing) {
                    return;
                }
                canvasItem.isSelected = !canvasItem.isSelected;
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                canvasItem.isEditing = true;
            }}>
            {canvasItem.isEditing ? <RenderTextAreaInput color={style.color}
                text={canvasItem.text}
                setText={(text) => {
                    canvasItem.update({ text });
                    canvasController.fireUpdateEvent();
                }} />
                : <BoxEditorRenderText text={canvasItem.text} />
            }
        </div>
    );
}

function RenderTextAreaInput({ color, text, setText }: {
    color?: string, text: string,
    setText: (t: string) => void,
}) {
    const [localText, setLocalText] = useState(text);
    useEffect(() => {
        setLocalText(text);
    }, [text]);
    return (
        <textarea style={{ color }}
            className='w-100 h-100' value={localText}
            onChange={(e) => {
                const newText = e.target.value;
                setLocalText(newText);
                setText(newText);
            }} />
    );
}
