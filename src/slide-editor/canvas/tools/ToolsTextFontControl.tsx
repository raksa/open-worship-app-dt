import Tool from './Tool';
import CanvasItemText from '../CanvasItemText';
import { useEffect, useState } from 'react';
import { useFontList } from '../../../server/fontHelpers';

export default function ToolsTextFontControl({ canvasItemText }: {
    canvasItemText: CanvasItemText,
}) {
    return (
        <Tool title='Font Size'>
            <FontSize canvasItemText={canvasItemText} />
            <hr />
            <FontFamily canvasItemText={canvasItemText} />
        </Tool>
    );
}
function FontSize({ canvasItemText }: {
    canvasItemText: CanvasItemText,
}) {
    const [localFontSize, setLocalFontSize] = useState(canvasItemText.props.fontSize);
    useEffect(() => {
        setLocalFontSize(canvasItemText.props.fontSize);
    }, [canvasItemText]);
    const applyFontSize = (fontSize: number) => {
        setLocalFontSize(fontSize);
        canvasItemText.applyTextData({ fontSize });
    };
    return (
        <div>
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
        </div>
    );
}
function FontFamily({ canvasItemText }: {
    canvasItemText: CanvasItemText,
}) {
    const fontList = useFontList();
    const [localFontFamily, setLocalFontFamily] = useState(canvasItemText.props.fontFamily);
    const applyFontFamily = (fontFamily: string) => {
        setLocalFontFamily(fontFamily);
        canvasItemText.applyTextData({
            fontFamily: fontFamily,
        });
    };
    if (fontList === null) {
        return null;
    }
    return (
        <div>
            <select className='form-select form-select-sm'
                value={localFontFamily}
                onChange={(e) => {
                    if (e.target.value === '--') {
                        return;
                    }
                    applyFontFamily(e.target.value);
                }} >
                <option>--</option>
                {fontList.map((ff, i) => {
                    return <option key={i} value={ff}>
                        {ff}
                    </option>;
                })}
            </select>
        </div>
    );
}
