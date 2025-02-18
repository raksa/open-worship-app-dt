import './ColorPicker.scss';

import { useState } from 'react';

import colorList from '../color-list.json';
import {
    AppColorType,
    transparentColor,
    colorToTransparent,
} from './colorHelpers';
import OpacitySlider from './OpacitySlider';
import RenderColors from './RenderColors';
import { useAppEffect } from '../../helper/debuggerHelpers';
import { freezeObject } from '../../helper/helpers';

freezeObject(colorList);

export default function ColorPicker({
    defaultColor,
    color,
    onColorChange,
    onNoColor,
}: Readonly<{
    defaultColor: AppColorType;
    color: AppColorType | null;
    onColorChange?: (color: AppColorType, event: MouseEvent) => void;
    onNoColor?: (color: AppColorType, event: MouseEvent) => void;
}>) {
    const [localColor, setLocalColor] = useState(color);
    const handleColorChanging = (newColor: AppColorType | null, event: any) => {
        if (newColor === null) {
            onNoColor?.(defaultColor, event);
            return;
        }
        const hex =
            localColor === null
                ? 'ff'
                : transparentColor(colorToTransparent(localColor));
        const newColorStr = newColor + hex;
        applyNewColor(newColorStr, event);
    };
    const handleOpacityChanging = (value: number, event: any) => {
        if (localColor === null) {
            return;
        }
        const hex = transparentColor(value);
        const newColor = localColor.split('');
        newColor[7] = hex[0];
        newColor[8] = hex[1];
        applyNewColor(newColor.join(''), event);
    };
    useAppEffect(() => {
        setLocalColor(color);
    }, [color]);
    const applyNewColor = (newColor: string, event: MouseEvent) => {
        const upperColor = newColor.toUpperCase() as AppColorType;
        if (!onColorChange) {
            return;
        }
        onColorChange(upperColor, event);
        setLocalColor(upperColor);
    };
    return (
        <div className="flex-item color-picker">
            <div className="p-3 overflow-hidden">
                <RenderColors
                    colors={colorList.main}
                    selectedColor={localColor}
                    onColorChange={handleColorChanging}
                />
                {localColor !== null && (
                    <OpacitySlider
                        value={colorToTransparent(localColor)}
                        onOpacityChanged={handleOpacityChanging}
                    />
                )}
            </div>
        </div>
    );
}
