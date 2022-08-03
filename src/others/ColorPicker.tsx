import './ColorPicker.scss';

import { showAppContextMenu } from './AppContextMenu';
import { copyToClipboard } from '../server/appHelper';
import { useEffect, useState } from 'react';
import colorList from './color-list.json';
import { AnyObjectType } from '../helper/helpers';

export const BLACK_COLOR = 'rgba(0,0,0,1)';
// type RGBAType = { r: number, g: number, b: number, a: number };
// const rgba2Object = (orig: string): RGBAType => {
//     try {
//         const rgba = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
//         if (rgba !== null) {
//             return { r: +rgba[1], g: +rgba[2], b: +rgba[1], a: +(rgba[4] || '1') };
//         }
//     } catch (error) {
//         console.log(error);
//     }
//     return rgba2Object(BLACK_COLOR);
// };
// function objectToRGBA(rbga: RGBAType): string {
//     return `rgba(${rbga.r},${rbga.g},${rbga.b},${rbga.a})`;
// }
export default function ColorPicker({ color, onColorChange }: {
    color: string, onColorChange: (color: string) => void
}) {
    const [localColor, setLocalColor] = useState(color);
    useEffect(() => {
        setLocalColor(color);
    }, [color]);
    return (
        <div className='color-picker border-white-round'>
            <div className='p-3 overflow-hidden'>
                <RenderColors colors={colorList.main}
                    selectedColor={localColor}
                    onColorChange={(newColor: string | null) => {
                        console.log('color', newColor);
                    }} />
                <OpacitySlider onOpacityChanged={(value: number) => {
                    console.log('opacity', value);
                }} />
            </div>
        </div>
    );
}

function RenderColors({
    colors, selectedColor,
    onColorChange,
}: {
    colors: AnyObjectType,
    selectedColor?: string,
    onColorChange: (color: string | null) => void,
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
                {Object.entries(colors).map(([name, color], i) => {
                    return (
                        <RenderColor key={i} name={name}
                            color={color}
                            isSelected={selectedColor === color}
                            onClick={() => {
                                onColorChange(color);
                            }} />
                    );
                })}
            </div>
            <div className='m-2'>
                <SelectCustomColor color={selectedColor}
                    onColorSelected={(color: string) => {
                        onColorChange(color);
                    }} />
            </div>
        </div>
    );
}
function showContextMenu(e: any, color: string) {
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
    name: string, color: string,
    isSelected?: boolean,
    onClick?: () => void,
}) {
    return (
        <div title={name}
            onContextMenu={(e) => {
                showContextMenu(e, color);
            }}
            className='m-1 color-item pointer'
            style={{
                width: '20px',
                height: '15px',
                backgroundColor: color,
                border: isSelected ?
                    '1px dashed #fff' : '',
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
    color?: string,
    onColorSelected: (color: string) => void,
}) {
    const [localColor, setLocalColor] = useState(color || '#ffffff');
    return (
        <input title='Select custom color'
            className='pointer'
            type='color' value={localColor}
            onBlur={() => {
                onColorSelected(localColor);
            }}
            onChange={(e) => {
                setLocalColor(e.target.value);
            }} />
    );
}

function OpacitySlider({ value, onOpacityChanged }: {
    value?: number,
    onOpacityChanged: (value: number) => void,
}) {
    const [localValue, setLocalValue] = useState(value || 1);
    return (
        <input type='range' value={localValue}
            className='form-range'
            step='1'
            min='0' max='100' onChange={(event) => {
                setLocalValue(+event.target.value);
            }}
            onMouseUp={() => {
                onOpacityChanged(localValue);
            }} />
    );
}
