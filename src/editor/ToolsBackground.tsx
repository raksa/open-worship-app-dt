import { useState } from 'react';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import ColorPicker from '../others/ColorPicker';
import Tool from './Tool';
import Align from './Align';
import HTML2ReactChild from '../slide-editing/HTML2ReactChild';

export default function ToolsBackground({ data }: { data: HTML2ReactChild }) {
    const [color, setColor] = useState<string>(data.backgroundColor);
    const onColorChange = (newColor: string) => {
        setColor(newColor);
        slideListEventListenerGlobal.tooling({ box: { backgroundColor: newColor } });
    };
    return (
        <>
            <Tool title='Background Color'>
                <ColorPicker color={color} onColorChange={onColorChange} />
            </Tool>
            <Tool title='Box Alignment'>
                <Align onData={(newData) => {
                    slideListEventListenerGlobal.tooling({ box: newData });
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListenerGlobal.tooling({ box: { layerBack: true } });
                }}><i className="bi bi-layer-backward" /></button>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListenerGlobal.tooling({ box: { layerFront: true } });
                }}><i className="bi bi-layer-forward" /></button>
            </Tool>
        </>
    );
}
