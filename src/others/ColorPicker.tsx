import './ColorPicker.scss';

import { createMouseEvent, showAppContextMenu } from './AppContextMenu';
import { copyToClipboard } from '../server/appHelper';
import { useEffect, useRef, useState } from 'react';
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
    onColorChange: (color: AppColorType | null, event: MouseEvent) => void
}) {
    const [localColor, setLocalColor] = useState(color);
    useEffect(() => {
        setLocalColor(color);
    }, [color]);
    const applyNewColor = (newColor: string, event: MouseEvent) => {
        const upperColor = newColor.toUpperCase() as AppColorType;
        onColorChange(upperColor, event);
        setLocalColor(upperColor);
    };
    return (
        <div className='color-picker border-white-round'>
            <div className='p-3 overflow-hidden'>
                <RenderColors colors={colorList.main}
                    selectedColor={localColor}
                    onColorChange={(newColor: AppColorType | null, e) => {
                        if (newColor === null) {
                            return onColorChange(null, e);
                        }
                        const hex = localColor === null ? 'ff' :
                            transparentColor(colorToTransparent(localColor));
                        const newColorStr = newColor + hex;
                        applyNewColor(newColorStr, e);
                    }} />
                {localColor !== null && <OpacitySlider
                    value={colorToTransparent(localColor)}
                    onOpacityChanged={(value: number, e) => {
                        const hex = transparentColor(value);
                        const newColor = localColor.split('');
                        newColor[7] = hex[0];
                        newColor[8] = hex[1];
                        applyNewColor(newColor.join(''), e);
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
    onColorChange: (color: AppColorType | null, event: MouseEvent) => void,
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
                    onClick={(event) => {
                        onColorChange(null, event);
                    }} />
                {Object.entries(colors).map(([name, color]: [string, AppColorType], i) => {
                    return (
                        <RenderColor key={i} name={name}
                            color={color}
                            isSelected={selectedColor !== null &&
                                compareColor(selectedColor, color)}
                            onClick={(event) => {
                                onColorChange(color, event);
                            }} />
                    );
                })}
            </div>
            <div className='m-2'>
                <SelectCustomColor color={selectedColor}
                    onColorSelected={(color: AppColorType, e) => {
                        onColorChange(color, e);
                    }} />
            </div>
        </div>
    );
}
function showContextMenu(event: any, color: AppColorType) {
    showAppContextMenu(event, [{
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
    onClick?: (event: MouseEvent) => void,
}) {
    return (
        <div title={name}
            onContextMenu={(event) => {
                showContextMenu(event, color);
            }}
            className={'m-1 color-item pointer' +
                (isSelected ? ' highlight-selected' : '')}
            style={{
                width: '20px',
                height: '15px',
                backgroundColor: color,
            }}
            onClick={(event) => {
                onClick?.(event as any);
            }} />
    );
}
function RenderNoColor({ isSelected, onClick }: {
    isSelected: boolean,
    onClick?: (event: MouseEvent) => void,
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
            onClick={(event) => {
                onClick?.(event as any);
            }}>x</div>
    );
}
function SelectCustomColor({ color, onColorSelected }: {
    color: AppColorType | null,
    onColorSelected: (color: AppColorType, event: MouseEvent) => void,
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localColor, setLocalColor] = useState<AppColorType>(color || '#ffffff');
    const applyColor = (newColor: AppColorType) => {
        setLocalColor(newColor);
        let e = createMouseEvent(0, 0);
        if (inputRef.current !== null) {
            e = createMouseEvent(inputRef.current.offsetLeft,
                inputRef.current.offsetLeft);
        }
        onColorSelected(newColor, e);
    };
    return (
        <input ref={inputRef} title='Select custom color'
            className='pointer'
            type='color' value={localColor}
            onKeyUp={(event) => {
                if (event.key === 'Enter') {
                    applyColor(localColor);
                }
            }}
            onBlur={() => {
                applyColor(localColor);
            }}
            onChange={(event) => {
                setLocalColor(event.target.value as any);
            }} />
    );
}

function OpacitySlider({ value, onOpacityChanged }: {
    value: number,
    onOpacityChanged: (value: number, event: MouseEvent) => void,
}) {
    const [localValue, setLocalValue] = useState(value || 1);
    return (
        <input type='range' value={localValue}
            className='form-range'
            step='1'
            min='0' max='255' onChange={(event) => {
                setLocalValue(+event.target.value);
            }}
            onMouseUp={(event) => {
                onOpacityChanged(localValue, event as any);
            }} />
    );
}
