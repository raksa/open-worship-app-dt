import './ColorPicker.scss';

import { showAppContextMenu } from './AppContextMenu';
import { copyToClipboard } from '../server/appHelper';
import { useEffect, useState } from 'react';
import colorList from './color-list.json';
import { AnyObjectType } from '../helper/helpers';

export const BLACK_COLOR = '#000000';
export type AppColorType = `#${string}`;
export const colorToTransparent = (color: AppColorType): number => {
    const hexStr = `${color[7]}${color[8]}`;
    return parseInt(hexStr, 16) || 255;
};
export const transparentColor = (n: number): string => {
    const hex = n.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
};
function compareColor(color1: AppColorType, color2: AppColorType): boolean {
    return color1.substring(0, 7).toLowerCase() ===
        color2.substring(0, 7).toLocaleLowerCase();
}

export default function ColorPicker({
    color, onColorChange,
}: {
    color: AppColorType | null,
    onColorChange: (color: AppColorType | null) => void
}) {
    const [localColor, setLocalColor] = useState(color);
    useEffect(() => {
        setLocalColor(color);
    }, [color]);
    const applyNewColor = (newColor: AppColorType) => {
        onColorChange(newColor);
        setLocalColor(newColor);
    };
    return (
        <div className='color-picker border-white-round'>
            <div className='p-3 overflow-hidden'>
                <RenderColors colors={colorList.main}
                    selectedColor={localColor}
                    onColorChange={(newColor: AppColorType | null) => {
                        if (newColor === null) {
                            return onColorChange(null);
                        }
                        const hex = localColor === null ? 'ff' :
                            transparentColor(colorToTransparent(localColor));
                        const newColorStr = newColor + hex;
                        applyNewColor(newColorStr as any);
                    }} />
                {localColor !== null && <OpacitySlider
                    value={colorToTransparent(localColor)}
                    onOpacityChanged={(value: number) => {
                        const hex = transparentColor(value);
                        const newColor = localColor.split('');
                        newColor[7] = hex[0];
                        newColor[8] = hex[1];
                        applyNewColor(newColor.join('') as any);
                    }} />}
            </div>
        </div>
    );
}

function RenderColors({
    colors, selectedColor,
    onColorChange,
}: {
    colors: AnyObjectType,
    selectedColor: AppColorType | null,
    onColorChange: (color: AppColorType | null) => void,
}) {
    return (
        <div>
            <div>
                {selectedColor ?
                    <RenderColor
                        name={selectedColor}
                        color={selectedColor}
                        isSelected /> :
                    <RenderNoColor
                        isSelected />
                }
            </div>
            <div className='d-flex flex-wrap border-white-round'>
                <RenderNoColor isSelected={!selectedColor}
                    onClick={() => {
                        onColorChange(null);
                    }} />
                {Object.entries(colors).map(([name, color]: [string, AppColorType], i) => {
                    return (
                        <RenderColor key={i} name={name}
                            color={color}
                            isSelected={selectedColor !== null &&
                                compareColor(selectedColor, color)}
                            onClick={() => {
                                onColorChange(color);
                            }} />
                    );
                })}
            </div>
            <div className='m-2'>
                <SelectCustomColor color={selectedColor}
                    onColorSelected={(color: AppColorType) => {
                        onColorChange(color);
                    }} />
            </div>
        </div>
    );
}
function showContextMenu(e: any, color: AppColorType) {
    showAppContextMenu(e, [{
        title: `Copy to '${color}' to clipboard`,
        onClick: () => {
            copyToClipboard(color);
        },
    }]);
}
function RenderColor({
    name, color, isSelected,
    onClick,
}: {
    name: string, color: AppColorType,
    isSelected?: boolean,
    onClick?: () => void,
}) {
    return (
        <div title={name}
            onContextMenu={(e) => {
                showContextMenu(e, color);
            }}
            className={'m-1 color-item pointer' + (isSelected ? ' highlight-selected' : '')}
            style={{
                width: '20px',
                height: '15px',
                backgroundColor: color,
            }}
            onClick={() => {
                onClick && onClick();
            }} />
    );
}
function RenderNoColor({ isSelected, onClick }: {
    isSelected: boolean,
    onClick?: () => void,
}) {
    return (
        <div title='no color'
            className='m-1 color-item pointer'
            style={{
                width: '20px',
                height: '15px',
                backgroundColor: '#fff',
                color: 'red',
                border: isSelected ?
                    '3px dashed #fff' : '',
            }}
            onClick={() => {
                onClick && onClick();
            }}>x</div>
    );
}
function SelectCustomColor({ color, onColorSelected }: {
    color: AppColorType | null,
    onColorSelected: (color: AppColorType) => void,
}) {
    const [localColor, setLocalColor] = useState<AppColorType>(color || '#ffffff');
    return (
        <input title='Select custom color'
            className='pointer'
            type='color' value={localColor}
            onKeyUp={(e) => {
                if (e.key === 'Enter') {
                    onColorSelected(localColor);
                }
            }}
            onBlur={() => {
                onColorSelected(localColor);
            }}
            onChange={(e) => {
                setLocalColor(e.target.value as any);
            }} />
    );
}

function OpacitySlider({ value, onOpacityChanged }: {
    value: number,
    onOpacityChanged: (value: number) => void,
}) {
    const [localValue, setLocalValue] = useState(value || 1);
    return (
        <input type='range' value={localValue}
            className='form-range'
            step='1'
            min='0' max='255' onChange={(event) => {
                setLocalValue(+event.target.value);
            }}
            onMouseUp={() => {
                onOpacityChanged(localValue);
            }} />
    );
}
