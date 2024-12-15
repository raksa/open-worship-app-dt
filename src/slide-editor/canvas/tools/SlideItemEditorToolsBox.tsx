import { use } from 'react';

import ColorPicker from '../../../others/color/ColorPicker';
import SlideItemEditor from './SlideItemEditorTool';
import ToolAlign from './SlideItemEditorToolAlign';
import { useCanvasControllerContext } from '../CanvasController';
import { ToolingBoxType } from '../canvasHelpers';
import { CanvasItemContext } from '../CanvasItem';
import { AppColorType } from '../../../others/color/colorHelpers';

export default function SlideItemEditorToolsBox() {
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
    const canvasItem = use(CanvasItemContext);
    if (canvasItem === null) {
        return null;
    }
    const parentDimension = {
        parentWidth: canvasController.canvas.width,
        parentHeight: canvasController.canvas.height,
    };
    const applyBoxData = (newData: ToolingBoxType) => {
        canvasItem.applyBoxData(parentDimension, newData);
        canvasController.fireUpdateEvent(canvasItem);
    };
    return (
        <>
            <SlideItemEditor title='Background Color'>
                <div style={{
                    maxWidth: '300px',
                }}>
                    <ColorPicker color={canvasItem.props.backgroundColor}
                        defaultColor='#ffffff'
                        onNoColor={handleNoColoring}
                        onColorChange={handleColorChanging}
                    />
                </div>
            </SlideItemEditor>
            <SlideItemEditor title='Box Alignment'>
                <ToolAlign onData={handleDataEvent} />
            </SlideItemEditor>
            <SlideItemEditor title='Box Layer'>
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
            </SlideItemEditor>
            <SlideItemEditor title='Rotate'>
                <button className='btn btn-info'
                    onClick={() => {
                        applyBoxData({
                            rotate: 0,
                        });
                    }}>
                    UnRotate
                </button>
                <hr />
                <button className='btn btn-secondary'
                    onClick={() => {
                        canvasController.applyCanvasItemFully(canvasItem);
                    }}>
                    Full
                </button>
                {['image', 'video'].includes(canvasItem.type) ? (
                    <button className='btn btn-secondary'
                        onClick={() => {
                            canvasController.applyCanvasItemMediaStrip(
                                canvasItem,
                            );
                        }}>
                        Strip
                    </button>
                ) : null}
            </SlideItemEditor>
        </>
    );
}