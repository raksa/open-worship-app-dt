import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItemText, {
    ToolingTextType,
} from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import { CanvasItemContext } from '../CanvasItem';
import CanvasController from '../CanvasController';
import { useContext } from 'react';

export default function ToolsText() {
    const canvasItem = useContext(CanvasItemContext);
    if (canvasItem === null) {
        return null;
    }
    if (!(canvasItem instanceof CanvasItemText)) {
        return null;
    }
    const canvasController = CanvasController.getInstance();
    const applyTextData = (newData: ToolingTextType) => {
        canvasItem.applyTextData(newData);
        canvasController.fireUpdateEvent();
    };
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={canvasItem.props.color}
                    onColorChange={(newColor: string) => {
                        applyTextData({
                            color: newColor,
                        });
                    }} />
            </Tool>
            <Tool title='Text Alignment'>
                <ToolAlign isText onData={(newData) => {
                    applyTextData({
                        textHorizontalAlignment: newData.horizontalAlignment,
                        textVerticalAlignment: newData.verticalAlignment,
                    });
                }} />
            </Tool>
            <ToolsTextFontControl canvasItemText={canvasItem} />
        </div>
    );
}
