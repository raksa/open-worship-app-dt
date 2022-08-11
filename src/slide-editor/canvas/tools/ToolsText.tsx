import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItemText, {
    ToolingTextType,
} from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import { CanvasItemContext } from '../CanvasItem';
import { useContext } from 'react';

export default function ToolsText() {
    const canvasItem = useContext(CanvasItemContext);
    if (canvasItem === null) {
        return null;
    }
    if (!(canvasItem instanceof CanvasItemText)) {
        return null;
    }
    const applyTextData = (newData: ToolingTextType) => {
        canvasItem.applyTextData(newData);
    };
    return (
        <div className='d-flex'>
            <Tool>
                <div style={{
                    maxWidth: '300px',
                }}>
                    <ColorPicker color={canvasItem.props.color}
                        onColorChange={(newColor) => {
                            applyTextData({
                                color: newColor || '#ffffff',
                            });
                        }} />
                </div>
            </Tool>
            <Tool title='Text Alignment'>
                <ToolAlign isText onData={(newData) => {
                    applyTextData({
                        textHorizontalAlignment: newData.horizontalAlignment,
                        textVerticalAlignment: newData.verticalAlignment,
                    });
                }} />
            </Tool>
            <ToolsTextFontControl
                canvasItemText={canvasItem} />
        </div>
    );
}
