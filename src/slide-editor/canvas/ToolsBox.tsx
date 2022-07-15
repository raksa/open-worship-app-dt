import ColorPicker from '../../others/ColorPicker';
import Tool from './Tool';
import Align from './Align';
import CanvasItem from './CanvasItem';

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
                        canvasController.applyToolingData(canvasItem, {
                            box: {
                                backgroundColor: newColor,
                            },
                        });
                    }} />
            </Tool>
            <Tool title='Box Alignment'>
                <Align onData={(newData) => {
                    canvasController.applyToolingData(canvasItem, {
                        box: newData,
                    });
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyToolingData(canvasItem, {
                        box: { layerBack: true },
                    });
                }}><i className="bi bi-layer-backward" /></button>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyToolingData(canvasItem, {
                        box: { layerFront: true },
                    });
                }}><i className="bi bi-layer-forward" /></button>
            </Tool>
        </>
    );
}
