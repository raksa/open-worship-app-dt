import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import {
    CanvasItemContext, ToolingBoxType,
} from '../CanvasItem';
import CanvasController from '../CanvasController';
import { useContext } from 'react';

export default function ToolsBox() {
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
                <ColorPicker color={canvasItem.props.backgroundColor}
                    onColorChange={(newColor: string) => {
                        applyBoxData({
                            backgroundColor: newColor,
                        });
                    }} />
            </Tool>
            <Tool title='Box Alignment'>
                <ToolAlign onData={(newData) => {
                    applyBoxData(newData);
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyOrderingData(
                        canvasItem, true);
                }}><i className='bi bi-layer-backward' /></button>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyOrderingData(
                        canvasItem, false);
                }}><i className='bi bi-layer-forward' /></button>
            </Tool>
            <Tool title='Rotate'>
                <button className='btn btn-info' onClick={() => {
                    applyBoxData({
                        rotate: 0,
                    });
                }}
                >UnRotate</button>
            </Tool>
        </>
    );
}
