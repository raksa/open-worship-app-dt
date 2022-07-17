import Tool from './Tool';
import CanvasItem from '../CanvasItem';
import { useEffect, useState } from 'react';
import { useFontList } from '../../../helper/helpers';

export default function ToolsTextFontControl({ canvasItem }: {
    canvasItem: CanvasItem,
}) {
    return (
        <Tool title='Font Size'>
            <FontSize canvasItem={canvasItem} />
            <hr />
            <FontFamily canvasItem={canvasItem} />
        </Tool>
    );
}
function FontSize({ canvasItem }: {
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
function FontFamily({ canvasItem }: {
    canvasItem: CanvasItem,
}) {
    const fontList = useFontList();
    const [localFontFamily, setLocalFontFamily] = useState(canvasItem.props.fontFamily);
    const applyFontFamily = (fontFamily: string) => {
        setLocalFontFamily(fontFamily);
        canvasItem.applyToolingData({
            text: { fontFamily: fontFamily },
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
