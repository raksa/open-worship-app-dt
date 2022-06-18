import { useState } from 'react';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import ColorPicker from '../others/ColorPicker';
import Tool from './Tool';
import Align from './Align';
import HTML2ReactChild from './HTML2ReactChild';

export default function ToolsText({ data }: { data: HTML2ReactChild }) {
    const [color, setColor] = useState<string>(data.color);
    const [fontSize, setFontSize] = useState<number>(data.fontSize);
    const onColorChange = (newColor: string) => {
        setColor(newColor);
        slideListEventListenerGlobal.tooling({ text: { color: newColor } });
    };
    const onFontSizeChange = (n: number) => {
        setFontSize(n);
        slideListEventListenerGlobal.tooling({ text: { fontSize: n } });
    };
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={color} onColorChange={onColorChange} />
            </Tool>
            <Tool title='Text Alignment'>
                <Align isText onData={(newData) => slideListEventListenerGlobal.tooling({ text: newData })} />
            </Tool>
            <Tool title='Font Size'>
                <input className='form-control' type="number" style={{ maxWidth: '100px' }}
                    value={fontSize} onChange={(e) => onFontSizeChange(+e.target.value)} />
                <select className="form-select form-select-sm" value={fontSize}
                    onChange={(e) => {
                        onFontSizeChange(+e.target.value);
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
                    slideListEventListenerGlobal.tooling({ box: { rotate: 0 } });
                }}
                >UnRotate</button>
            </Tool>
        </div>
    );
}
