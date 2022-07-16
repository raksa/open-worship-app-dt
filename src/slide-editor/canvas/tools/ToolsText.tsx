import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItem from '../CanvasItem';
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
                        canvasItem.applyToolingData({
                            text: { color: newColor },
                        });
                    }} />
            </Tool>
            <Tool title='Text Alignment'>
                <ToolAlign isText onData={(newData) => {
                    canvasItem.applyToolingData({
                        text: newData,
                    });
                }} />
            </Tool>
            <ToolsTextFontControl canvasItem={canvasItem} />
            <Tool title='Rotate'>
                <button className='btn btn-info' onClick={() => {
                    canvasItem.applyToolingData({
                        box: { rotate: 0 },
                    });
                }}
                >UnRotate</button>
            </Tool>
        </div>
    );
}
