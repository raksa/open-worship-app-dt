import SlideItemEditorToolTitleComp from './SlideItemEditorToolTitleComp';
import SlideItemEditorToolAlign from './SlideItemEditorToolAlign';
import CanvasItemText, {
    ToolingTextType,
} from '../CanvasItemText';
import ToolsTextFontControl from './ToolsTextFontControl';
import { AppColorType } from '../../../others/color/colorHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import SlideItemEditorToolsColorComp from './SlideItemEditorToolsColorComp';

export default function SlideItemEditorToolsText({ canvasItem }: Readonly<{
    canvasItem: CanvasItemText,
}>) {
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
    const applyTextData = (newData: ToolingTextType) => {
        canvasItem.applyTextData(newData);
        canvasController.fireUpdateEvent();
    };
    return (
        <div className='d-flex'>
            <SlideItemEditorToolsColorComp
                color={canvasItem.props.color}
                handleColorChanging={handleColorChanging}
            />
            <div className='ps-2'>
                <SlideItemEditorToolTitleComp title='Text Alignment'>
                    <SlideItemEditorToolAlign isText
                        onData={handleDataEvent}
                    />
                </SlideItemEditorToolTitleComp>
                <hr />
                <ToolsTextFontControl
                    canvasItemText={canvasItem}
                />
            </div>
        </div>
    );
}
