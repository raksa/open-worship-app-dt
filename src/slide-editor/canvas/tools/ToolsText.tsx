import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItemText from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import CanvasItem from '../CanvasItem';

export default function ToolsText({ canvasItem }: {
    canvasItem: CanvasItem<any>,
}) {
    if (!(canvasItem instanceof CanvasItemText)) {
        return null;
    }
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={canvasItem.props.color}
                    onColorChange={(newColor: string) => {
                        canvasItem.applyTextData({
                            color: newColor,
                        });
                    }} />
            </Tool>
            <Tool title='Text Alignment'>
                <ToolAlign isText onData={(newData) => {
                    canvasItem.applyTextData({
                        textHorizontalAlignment: newData.horizontalAlignment,
                        textVerticalAlignment: newData.verticalAlignment,
                    });
                }} />
            </Tool>
            <ToolsTextFontControl canvasItemText={canvasItem} />
        </div>
    );
}
