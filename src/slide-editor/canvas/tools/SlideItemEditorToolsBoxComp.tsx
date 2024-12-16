import SlideItemEditorToolTitleComp from './SlideItemEditorToolTitleComp';
import SlideItemEditorToolAlignComp from './SlideItemEditorToolAlignComp';
import { useCanvasControllerContext } from '../CanvasController';
import { ToolingBoxType } from '../canvasHelpers';
import CanvasItem from '../CanvasItem';
import { AppColorType } from '../../../others/color/colorHelpers';
import SlideItemEditorToolsColorComp from './SlideItemEditorToolsColorComp';

function SizingComp({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const canvasController = useCanvasControllerContext();
    return (
        <SlideItemEditorToolTitleComp title='Size'>
            <button className='btn btn-secondary'
                onClick={() => {
                    canvasController.applyCanvasItemFully(canvasItem);
                }}>
                Full
            </button>
            {['image', 'video'].includes(canvasItem.type) ? (
                <button className='btn btn-secondary ms-1'
                    onClick={() => {
                        canvasController.applyCanvasItemMediaStrip(
                            canvasItem,
                        );
                    }}>
                    Strip
                </button>
            ) : null}
        </SlideItemEditorToolTitleComp>
    );
}

function LayerComp({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const canvasController = useCanvasControllerContext();
    const parentDimension = {
        parentWidth: canvasController.canvas.width,
        parentHeight: canvasController.canvas.height,
    };
    const applyBoxData = (newData: ToolingBoxType) => {
        canvasItem.applyBoxData(parentDimension, newData);
        canvasController.fireUpdateEvent(canvasItem);
    };
    return (
        <div className='ps-2'>
            <div className='d-flex'>
                <SlideItemEditorToolTitleComp title='Box Layer'>
                    <button className='btn btn-info'
                        onClick={() => {
                            canvasController.applyOrderingData(
                                canvasItem, true);
                        }}>
                        <i className='bi bi-layer-backward' />
                    </button>
                    <button className='btn btn-info'
                        onClick={() => {
                            canvasController.applyOrderingData(
                                canvasItem, false);
                        }}>
                        <i className='bi bi-layer-forward' />
                    </button>
                </SlideItemEditorToolTitleComp>
                <SlideItemEditorToolTitleComp title='Rotate'>
                    <button className='btn btn-info'
                        onClick={() => {
                            applyBoxData({
                                rotate: 0,
                            });
                        }}>
                        UnRotate
                    </button>
                </SlideItemEditorToolTitleComp>
            </div>
        </div>
    );
}

export default function SlideItemEditorToolsBoxComp({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const canvasController = useCanvasControllerContext();
    const handleDataEvent = (newData: any) => {
        applyBoxData(newData);
    };
    const handleNoColoring = () => {
        applyBoxData({
            backgroundColor: null,
        });
    };
    const handleColorChanging = (newColor: AppColorType) => {
        applyBoxData({
            backgroundColor: newColor,
        });
    };
    const parentDimension = {
        parentWidth: canvasController.canvas.width,
        parentHeight: canvasController.canvas.height,
    };
    const applyBoxData = (newData: ToolingBoxType) => {
        canvasItem.applyBoxData(parentDimension, newData);
        canvasController.fireUpdateEvent(canvasItem);
    };
    return (
        <div className='d-flex'>
            <SlideItemEditorToolsColorComp
                color={canvasItem.props.backgroundColor}
                handleNoColoring={handleNoColoring}
                handleColorChanging={handleColorChanging}
            />
            <div className='ps-2'>
                <SlideItemEditorToolTitleComp title='Box Alignment'>
                    <SlideItemEditorToolAlignComp onData={handleDataEvent} />
                </SlideItemEditorToolTitleComp>
                <LayerComp canvasItem={canvasItem} />
                <SizingComp canvasItem={canvasItem} />
            </div>
        </div>
    );
}
