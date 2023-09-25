import { useCallback, useContext } from 'react';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItemText, {
    ToolingTextType,
} from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import { CanvasItemContext } from '../CanvasItem';
import ColorPicker from '../../../others/color/ColorPicker';
import { AppColorType } from '../../../others/color/colorHelpers';

export default function ToolsText() {
    const onDataCallback = useCallback((newData: any) => {
        const textData: ToolingTextType = {};
        if (newData.horizontalAlignment !== undefined) {
            textData.textHorizontalAlignment = newData.horizontalAlignment;
        }
        if (newData.verticalAlignment !== undefined) {
            textData.textVerticalAlignment = newData.verticalAlignment;
        }
        applyTextData(textData);
    }, []);
    const onNoColorCallback = useCallback((
        newColor: AppColorType) => {
        applyTextData({
            color: newColor,
        });
    }, []);
    const onColorChangedCallback = useCallback((
        newColor: AppColorType) => {
        applyTextData({
            color: newColor,
        });
    }, []);
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
                        defaultColor='#ffffff'
                        onNoColor={onNoColorCallback}
                        onColorChange={onColorChangedCallback} />
                </div>
            </Tool>
            <Tool title='Text Alignment'>
                <ToolAlign isText onData={onDataCallback} />
            </Tool>
            <ToolsTextFontControl
                canvasItemText={canvasItem} />
        </div>
    );
}
