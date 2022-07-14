import ColorPicker from '../../others/ColorPicker';
import Tool from './Tool';
import Align from './Align';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';

export default function ToolsText({
    canvasItem, canvasController,
}: {
    canvasController: CanvasController,
    canvasItem: CanvasItem,
}) {
    const applyFontSize = (fontSize: number) => {
        canvasController.applyToolingData({
            text: { fontSize },
        });
    };
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={canvasItem.color}
                    onColorChange={(newColor: string) => {
                        canvasController.applyToolingData({ text: { color: newColor } });
                    }} />
            </Tool>
            <Tool title='Text Alignment'>
                <Align isText onData={(newData) => {
                    canvasController.applyToolingData({ text: newData });
                }} />
            </Tool>
            <Tool title='Font Size'>
                <input className='form-control' type="number" style={{ maxWidth: '100px' }}
                    value={canvasItem.fontSize}
                    onChange={(e) => {
                        applyFontSize(+e.target.value);
                    }} />
                <select className="form-select form-select-sm"
                    value={canvasItem.fontSize}
                    onChange={(e) => {
                        applyFontSize(+e.target.value);
                    }} >
                    <option>--</option>
                    {Array.from({ length: 20 }, (_, i) => (i + 1) * 15)
                        .reverse().map((n, i) => {
                            return <option key={`${i}`} value={n}>{n}px</option>;
                        })}
                </select>
            </Tool>
            <Tool title='Rotate'>
                <button className='btn btn-info' onClick={() => {
                    canvasController.applyToolingData({ box: { rotate: 0 } });
                }}
                >UnRotate</button>
            </Tool>
        </div>
    );
}
