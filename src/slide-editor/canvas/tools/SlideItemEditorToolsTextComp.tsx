import SlideItemEditorToolTitleComp from './SlideItemEditorToolTitleComp';
import SlideItemEditorToolAlignComp from './SlideItemEditorToolAlignComp';
import CanvasItemText, { ToolingTextType } from '../CanvasItemText';
import ToolsTextFontControlComp from './ToolsTextFontControlComp';
import { AppColorType } from '../../../others/color/colorHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import SlideItemEditorToolsColorComp from './SlideItemEditorToolsColorComp';
import { useCanvasItemContext } from '../CanvasItem';

export default function SlideItemEditorToolsTextComp() {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext() as CanvasItemText;
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
        canvasController.fireEditEvent(canvasItem);
    };
    return (
        <div className='d-flex'>
            <SlideItemEditorToolsColorComp
                color={canvasItem.props.color}
                handleColorChanging={handleColorChanging}
            />
            <div className='ps-2'>
                <SlideItemEditorToolTitleComp title='Text Alignment'>
                    <SlideItemEditorToolAlignComp isText
                        onData={handleDataEvent}
                    />
                </SlideItemEditorToolTitleComp>
                <hr />
                <ToolsTextFontControlComp />
            </div>
        </div>
    );
}
