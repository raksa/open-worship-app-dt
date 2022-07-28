import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItemText from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import CanvasItem from '../CanvasItem';
import { useContextCC } from '../CanvasController';

export default function ToolsText({ canvasItem }: {
    canvasItem: CanvasItem<any>,
}) {
    const canvasController = useContextCC();
    if (canvasController === null) {
        return null;
    }
    if (!canvasItem.isTypeText) {
        return null;
    }
    const canvasItemText = canvasItem as CanvasItemText;
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={canvasItemText.props.color}
                    onColorChange={(newColor: string) => {
                        canvasItemText.applyTextData(canvasController, {
                            color: newColor,
                        });
                    }} />
            </Tool>
            <Tool title='Text Alignment'>
                <ToolAlign isText onData={(newData) => {
                    canvasItemText.applyTextData(
                        canvasController, newData);
                }} />
            </Tool>
            <ToolsTextFontControl canvasItemText={canvasItemText} />
        </div>
    );
}
