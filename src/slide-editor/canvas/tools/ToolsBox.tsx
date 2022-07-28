import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItem from '../CanvasItem';
import { useContextCC } from '../CanvasController';

export default function ToolsBox({
    canvasItem,
}: {
    canvasItem: CanvasItem<any>,
}) {
    const canvasController = useContextCC();
    if (canvasController === null) {
        return null;
    }

    return (
        <>
            <Tool title='Background Color'>
                <ColorPicker color={canvasItem.props.backgroundColor}
                    onColorChange={(newColor: string) => {
                        canvasItem.applyBoxData(canvasController, {
                            backgroundColor: newColor,
                        });
                    }} />
            </Tool>
            <Tool title='Box Alignment'>
                <ToolAlign onData={(newData) => {
                    canvasItem.applyBoxData(canvasController, newData);
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    canvasController?.applyOrderingData(
                        canvasItem, true);
                }}><i className='bi bi-layer-backward' /></button>
                <button className='btn btn-info' onClick={() => {
                    canvasController?.applyOrderingData(
                        canvasItem, false);
                }}><i className='bi bi-layer-forward' /></button>
            </Tool>
            <Tool title='Rotate'>
                <button className='btn btn-info' onClick={() => {
                    canvasItem.applyBoxData(canvasController, {
                        rotate: 0,
                    });
                }}
                >UnRotate</button>
            </Tool>
        </>
    );
}
