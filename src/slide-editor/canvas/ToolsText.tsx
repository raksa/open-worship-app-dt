import ColorPicker from '../../others/ColorPicker';
import Tool from './Tool';
import Align from './Align';
import CanvasItem from './CanvasItem';
import ToolsTextFontControl from './ToolsTextFontControl';

export default function ToolsText({
    canvasItem,
}: {
    canvasItem: CanvasItem,
}) {
    const canvasController = canvasItem.canvasController;
    if (canvasController === null) {
        return null;
    }
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={canvasItem.props.color}
                    onColorChange={(newColor: string) => {
                        canvasController.applyToolingData(canvasItem, {
                            text: { color: newColor },
                        });
                    }} />
            </Tool>
            <Tool title='Text Alignment'>
                <Align isText onData={(newData) => {
                    canvasController.applyToolingData(canvasItem, {
                        text: newData,
                    });
                }} />
            </Tool>
            <ToolsTextFontControl canvasItem={canvasItem}
                canvasController={canvasController} />
            <Tool title='Rotate'>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyToolingData(canvasItem, {
                        box: { rotate: 0 },
                    });
                }}
                >UnRotate</button>
            </Tool>
        </div>
    );
}
