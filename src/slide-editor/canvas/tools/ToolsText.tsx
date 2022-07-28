import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItemText from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import CanvasItem from '../CanvasItem';

export default function ToolsText({ canvasItem }: {
    canvasItem: CanvasItem<any>,
}) {
    if (canvasItem.isTypeText) {
        return null;
    }
    const canvasItemText = canvasItem as CanvasItemText;
    const canvasController = canvasItemText.canvasController;
    if (canvasController === null) {
        return null;
    }
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={canvasItemText.props.color}
                    onColorChange={(newColor: string) => {
                        canvasItemText.applyTextData({
                            color: newColor,
                        });
                    }} />
            </Tool>
            <Tool title='Text Alignment'>
                <ToolAlign isText onData={(newData) => {
                    canvasItemText.applyTextData(newData);
                }} />
            </Tool>
            <ToolsTextFontControl canvasItemText={canvasItemText} />
        </div>
    );
}
