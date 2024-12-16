import SlideItemEditorToolTitleComp from './SlideItemEditorToolTitleComp';
import SlideItemEditorToolAlignComp from './SlideItemEditorToolAlignComp';
import CanvasItemText, {
    ToolingTextType,
} from '../CanvasItemText';
import ToolsTextFontControlComp from './ToolsTextFontControlComp';
import { AppColorType } from '../../../others/color/colorHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import SlideItemEditorToolsColorComp from './SlideItemEditorToolsColorComp';

export default function SlideItemEditorToolsTextComp({ canvasItem }: Readonly<{
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
                    <SlideItemEditorToolAlignComp isText
                        onData={handleDataEvent}
                    />
                </SlideItemEditorToolTitleComp>
                <hr />
                <ToolsTextFontControlComp
                    canvasItemText={canvasItem}
                />
            </div>
        </div>
    );
}
