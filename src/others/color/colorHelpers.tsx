import { DragTypeEnum } from '../../helper/DragInf';
import { handleDragStart } from '../../helper/dragHelpers';

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

export function compareColor(
    color1: AppColorType, color2: AppColorType,
): boolean {
    return color1.substring(0, 7).toLowerCase() ===
        color2.substring(0, 7).toLocaleLowerCase();
}

export function colorDeserialize(data: AppColorType) {
    return data;
}
export function serializeForDragging(event: any, color: AppColorType) {
    handleDragStart(event, {
        dragSerialize: () => {
            return {
                type: DragTypeEnum.BACKGROUND_COLOR,
                data: color,
            };
        },
    });
}
