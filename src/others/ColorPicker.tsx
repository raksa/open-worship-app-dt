import './ColorPicker.scss';

import { RgbaColorPicker } from "react-colorful";
import { showAppContextMenu } from '../helper/AppContextMenu';
import { copyToClipboard } from '../helper/electronHelper';

export const WHITE_COLOR = 'rgba(255,255,255,1)';
type RGBAType = { r: number, g: number, b: number, a: number };
const rgba2Object = (orig: string): RGBAType => {
    try {
        const rgba = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
        if (rgba !== null) {
            return { r: +rgba[1], g: +rgba[2], b: +rgba[1], a: +(rgba[4] || '1') };
        }
    } catch (error) {
        console.log(error);
    }
    return rgba2Object(WHITE_COLOR);
};
function objectToRGBA(rbga: RGBAType): string {
    return `rgba(${rbga.r},${rbga.g},${rbga.b},${rbga.a})`;
}
export default function ColorPicker({ color, onColorChange }: {
    color: string, onColorChange: (color: string) => void
}) {
    return (
        <div className="color-picker">
            <div className='p-2 overflow-hidden'>
                <button className='btn btn-sm btn-info' onClick={(e) => {
                    showAppContextMenu(e, [
                        {
                            title: `Copy to Clipboard`, onClick: () => {
                                copyToClipboard(color);
                            }
                        },
                    ]);
                }}>{color}</button>
                <RgbaColorPicker
                    color={rgba2Object(color)}
                    onChange={(color) => {
                        onColorChange(objectToRGBA(color));
                    }}
                />
            </div>
        </div>
    );
}
