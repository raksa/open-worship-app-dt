import { useCallback } from 'react';
import { AnyObjectType } from '../../helper/helpers';
import { AppColorType, compareColor } from './colorHelpers';
import SelectCustomColor from './SelectCustomColor';
import RenderColor from './RenderColor';
import RenderNoColor from './RenderNoColor';


export default function RenderColors({
    colors, selectedColor,
    onColorChange,
}: {
    colors: AnyObjectType,
    selectedColor: AppColorType | null,
    onColorChange: (color: AppColorType | null, event: MouseEvent) => void,
}) {
    const onNoColorCallback = useCallback((event: any) => {
        onColorChange(null, event);
    }, [onColorChange]);
    const onColorCallback = useCallback((
        event: any, color: AppColorType) => {
        onColorChange(color, event);
    }, [onColorChange]);
    const onColorSelectCallback = useCallback((
        color: AppColorType, event: any) => {
        onColorChange(color, event);
    }, [onColorChange]);
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
                    onClick={onNoColorCallback} />
                {Object.entries(colors).map(([name, color]:
                    [string, AppColorType]) => {
                    return (
                        <RenderColor key={color} name={name}
                            color={color}
                            isSelected={selectedColor !== null &&
                                compareColor(selectedColor, color)}
                            onClick={onColorCallback} />
                    );
                })}
            </div>
            <div className='m-2'>
                <SelectCustomColor color={selectedColor}
                    onColorSelected={onColorSelectCallback} />
            </div>
        </div>
    );
}
