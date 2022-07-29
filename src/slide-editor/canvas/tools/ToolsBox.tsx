import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItem from '../CanvasItem';
import { canvasController } from '../CanvasController';

export default function ToolsBox({ canvasItem }: {
    canvasItem: CanvasItem<any>,
}) {
    return (
        <>
            <Tool title='Background Color'>
                <ColorPicker color={canvasItem.props.backgroundColor}
                    onColorChange={(newColor: string) => {
                        canvasItem.applyBoxData({
                            backgroundColor: newColor,
                        });
                    }} />
            </Tool>
            <Tool title='Box Alignment'>
                <ToolAlign onData={(newData) => {
                    canvasItem.applyBoxData(newData);
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
                    canvasItem.applyBoxData({
                        rotate: 0,
                    });
                }}
                >UnRotate</button>
            </Tool>
        </>
    );
}
