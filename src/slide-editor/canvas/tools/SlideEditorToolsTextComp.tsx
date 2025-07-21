import SlideEditorToolTitleComp from './SlideEditorToolTitleComp';
import SlideEditorToolAlignComp from './SlideEditorToolAlignComp';
import { CanvasItemTextPropsType } from '../CanvasItemText';
import ToolsTextFontControlComp from './ToolsTextFontControlComp';
import SlideEditorToolsColorComp from './SlideEditorToolsColorComp';
import { useCanvasItemPropsSetterContext } from '../CanvasItem';

export default function SlideEditorToolsTextComp() {
    const [props, setProps] =
        useCanvasItemPropsSetterContext<CanvasItemTextPropsType>();
    return (
        <div className="d-flex flex-wrap app-inner-shadow">
            <div className="p-1">
                <SlideEditorToolTitleComp title="Color">
                    <SlideEditorToolsColorComp
                        color={props.color}
                        handleColorChanging={(newColor) => {
                            setProps({
                                color: newColor,
                            });
                        }}
                    />
                </SlideEditorToolTitleComp>
            </div>
            <div
                className="ps-1"
                style={{
                    minWidth: '300px',
                }}
            >
                <SlideEditorToolTitleComp title="Text Alignment">
                    <SlideEditorToolAlignComp
                        isText
                        data={{
                            horizontalAlignment: props.textHorizontalAlignment,
                            verticalAlignment: props.textVerticalAlignment,
                        }}
                        onData={(data) => {
                            setProps({
                                textHorizontalAlignment:
                                    data.horizontalAlignment,
                                textVerticalAlignment: data.verticalAlignment,
                            });
                        }}
                    />
                </SlideEditorToolTitleComp>
                <hr />
                <ToolsTextFontControlComp />
            </div>
        </div>
    );
}
