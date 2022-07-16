import ColorPicker from '../../../others/ColorPicker';
import Tool from './Tool';
import ToolAlign from './ToolAlign';
import CanvasItem from '../CanvasItem';

export default function ToolsBox({
    canvasItem,
}: {
    canvasItem: CanvasItem,
}) {
    const canvasController = canvasItem.canvasController;
    if (canvasController === null) {
        return null;
    }
    return (
        <>
            <Tool title='Background Color'>
                <ColorPicker color={canvasItem.props.backgroundColor}
                    onColorChange={(newColor: string) => {
                        canvasItem.applyToolingData({
                            box: {
                                backgroundColor: newColor,
                            },
                        });
                    }} />
            </Tool>
            <Tool title='Box Alignment'>
                <ToolAlign onData={(newData) => {
                    canvasItem.applyToolingData({
                        box: newData,
                    });
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    canvasItem.canvasController?.applyOrderingData(
                        canvasItem, true);
                }}><i className='bi bi-layer-backward' /></button>
                <button className='btn btn-info' onClick={() => {
                    canvasItem.canvasController?.applyOrderingData(
                        canvasItem, false);
                }}><i className='bi bi-layer-forward' /></button>
            </Tool>
        </>
    );
}
