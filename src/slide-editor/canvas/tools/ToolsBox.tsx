import { useCallback, useContext } from 'react';

import ColorPicker from '../../../others/color/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasController from '../CanvasController';
import { ToolingBoxType } from '../canvasHelpers';
import { CanvasItemContext } from '../CanvasItem';
import { AppColorType } from '../../../others/color/colorHelpers';

export default function ToolsBox() {
    const onDataCallback = useCallback((newData: any) => {
        applyBoxData(newData);
    }, []);
    const onNoColorCallback = useCallback(() => {
        applyBoxData({
            backgroundColor: null,
        });
    }, []);
    const onColorChangedCallback = useCallback((
        newColor: AppColorType) => {
        applyBoxData({
            backgroundColor: newColor,
        });
    }, []);
    const canvasItem = useContext(CanvasItemContext);
    if (canvasItem === null) {
        return null;
    }
    const canvasController = CanvasController.getInstance();
    const parentDimension = {
        parentWidth: canvasController.canvas.width,
        parentHeight: canvasController.canvas.height,
    };
    const applyBoxData = (newData: ToolingBoxType) => {
        canvasItem.applyBoxData(parentDimension, newData);
        canvasController.fireUpdateEvent();
    };
    return (
        <>
            <Tool title='Background Color'>
                <div style={{
                    maxWidth: '300px',
                }}>
                    <ColorPicker color={canvasItem.props.backgroundColor}
                        defaultColor='#ffffff'
                        onNoColor={onNoColorCallback}
                        onColorChange={onColorChangedCallback} />
                </div>
            </Tool>
            <Tool title='Box Alignment'>
                <ToolAlign onData={onDataCallback} />
            </Tool>
            <Tool title='Box Layer'>
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
            </Tool>
            <Tool title='Rotate'>
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
            </Tool>
        </>
    );
}
