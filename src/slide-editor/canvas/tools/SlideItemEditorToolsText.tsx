import { use } from 'react';

import SlideItemEditor from './SlideItemEditorTool';
import ToolAlign from './SlideItemEditorToolAlign';
import CanvasItemText, {
    ToolingTextType,
} from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import { CanvasItemContext } from '../CanvasItem';
import ColorPicker from '../../../others/color/ColorPicker';
import { AppColorType } from '../../../others/color/colorHelpers';
import { useCanvasControllerContext } from '../CanvasController';

export default function ToolsText() {
    const canvasController = useCanvasControllerContext();
    const handleDataEvent = (newData: any) => {
        const textData: ToolingTextType = {};
        if (newData.horizontalAlignment !== undefined) {
            textData.textHorizontalAlignment = newData.horizontalAlignment;
        }
        if (newData.verticalAlignment !== undefined) {
            textData.textVerticalAlignment = newData.verticalAlignment;
        }
        applyTextData(textData);
    };
    const handleColorChanging = (newColor: AppColorType) => {
        applyTextData({
            color: newColor,
        });
    };
    const canvasItem = use(CanvasItemContext);
    if (canvasItem === null) {
        return null;
    }
    if (!(canvasItem instanceof CanvasItemText)) {
        return null;
    }
    const applyTextData = (newData: ToolingTextType) => {
        canvasItem.applyTextData(newData);
        canvasController.fireUpdateEvent();
    };
    return (
        <div className='d-flex'>
            <SlideItemEditor>
                <div style={{
                    maxWidth: '300px',
                }}>
                    <ColorPicker color={canvasItem.props.color}
                        defaultColor='#ffffff'
                        onNoColor={handleColorChanging}
                        onColorChange={handleColorChanging} />
                </div>
            </SlideItemEditor>
            <SlideItemEditor title='Text Alignment'>
                <ToolAlign isText onData={handleDataEvent} />
            </SlideItemEditor>
            <ToolsTextFontControl
                canvasItemText={canvasItem} />
        </div>
    );
}
