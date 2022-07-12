import ColorPicker from '../others/ColorPicker';
import Tool from './Tool';
import Align from './Align';
import CanvasItem from './CanvasItem';

export default function ToolsBackground({ canvasItem }: {
    canvasItem: CanvasItem,
}) {
    const canvasController = canvasItem.canvasController;
    return (
        <>
            <Tool title='Background Color'>
                <ColorPicker color={canvasItem.color}
                    onColorChange={(newColor: string) => {
                        canvasController.applyToolingData({
                            box: {
                                backgroundColor: newColor,
                            },
                        });
                    }} />
            </Tool>
            <Tool title='Box Alignment'>
                <Align onData={(newData) => {
                    canvasController.applyToolingData({ box: newData });
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyToolingData({ box: { layerBack: true } });
                }}><i className="bi bi-layer-backward" /></button>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyToolingData({ box: { layerFront: true } });
                }}><i className="bi bi-layer-forward" /></button>
            </Tool>
        </>
    );
}
