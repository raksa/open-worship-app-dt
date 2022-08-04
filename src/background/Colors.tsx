import { presentEventListener } from '../event/PresentEventListener';
import { useState } from 'react';
import ColorPicker, { AppColorType } from '../others/ColorPicker';
import { clearBackground, renderBGColor } from '../helper/presentingHelpers';


export default function Colors() {
    const [color, setColor] = useState<AppColorType|null>('#55efc4');
    const onColorChange = (newColor: AppColorType | null) => {
        setColor(newColor);
        if(newColor === null) {
            clearBackground();
        } else {
            renderBGColor(newColor);
        }
        presentEventListener.renderBG();
    };
    return (
        <ColorPicker color={color}
            onColorChange={onColorChange} />
    );
}
