import { presentEventListener } from '../event/PresentEventListener';
import { useState } from 'react';
import ColorPicker from '../others/ColorPicker';
import { renderBGColor } from '../helper/presentingHelpers';


export default function Colors() {
    const [color, setColor] = useState('#55efc4');
    const onColorChange = (newColor: string) => {
        renderBGColor(newColor);
        setColor(newColor);
        presentEventListener.renderBG();
    };
    return (
        <ColorPicker color={color} onColorChange={onColorChange} />
    );
}
