import Tool from './Tool';
import CanvasItem from '../CanvasItem';
import { useEffect, useState } from 'react';

export default function ToolsTextFontControl({ canvasItem }: {
    canvasItem: CanvasItem,
}) {
    const [localFontSize, setLocalFontSize] = useState(canvasItem.props.fontSize);
    useEffect(() => {
        setLocalFontSize(canvasItem.props.fontSize);
    }, [canvasItem]);
    const applyFontSize = (fontSize: number) => {
        setLocalFontSize(fontSize);
        canvasItem.applyToolingData({
            text: { fontSize },
        });
    };
    return (
        <Tool title='Font Size'>
            <input className='form-control' type='number'
                style={{ maxWidth: '100px' }}
                value={localFontSize}
                onChange={(e) => {
                    applyFontSize(+e.target.value);
                }} />
            <select className='form-select form-select-sm'
                value={localFontSize}
                onChange={(e) => {
                    applyFontSize(+e.target.value);
                }} >
                <option>--</option>
                {Array.from({ length: 20 }, (_, i) => (i + 1) * 15)
                    .reverse().map((n, i) => {
                        return <option key={`${i}`}
                            value={n}>{n}px</option>;
                    })}
            </select>
        </Tool>
    );
}
