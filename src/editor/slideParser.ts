import { getRotationDeg, removePX } from '../helper/helpers';
import { BLACK_COLOR } from '../others/ColorPicker';

export enum HAlignmentEnum {
    Left = 'left',
    Center = 'center',
    Right = 'right',
}
export enum VAlignmentEnum {
    Top = 'start',
    Center = 'center',
    Bottom = 'end',
}
export type HTML2ReactChildType = {
    text: string,
    fontSize: number,
    color: string,
    top: number,
    left: number,
    rotate: number,
    width: number,
    height: number,
    horizontalAlignment: HAlignmentEnum,
    verticalAlignment: VAlignmentEnum,
    backgroundColor: string,
    zIndex: number,
};
export type HTML2ReactType = {
    width: number,
    height: number,
    children: HTML2ReactChildType[],
};
export function parseChildHTML(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const element = div.firstChild as HTMLDivElement;
    const style = element.style;
    const d: HTML2ReactChildType = {
        text: element.innerHTML,
        fontSize: removePX(style.fontSize) || 30,
        color: style.color || BLACK_COLOR,
        top: removePX(style.top) || 3,
        left: removePX(style.left) || 3,
        rotate: getRotationDeg(style.transform),
        width: removePX(style.width) || 500,
        height: removePX(style.height) || 150,
        horizontalAlignment: (style.justifyContent || HAlignmentEnum.Left) as HAlignmentEnum,
        verticalAlignment: (style.alignItems || VAlignmentEnum.Top) as VAlignmentEnum,
        backgroundColor: style.backgroundColor || 'transparent',
        zIndex: +style.zIndex || 0,
    };
    return d;
}
export function parseHTML(html: string): HTML2ReactType {
    const div = document.createElement('div');
    div.innerHTML = html;
    const mainDiv = div.firstChild as HTMLDivElement;
    const children = Array.from(mainDiv.children).map((ele): HTML2ReactChildType => {
        return parseChildHTML(ele.outerHTML);
    });
    return {
        width: removePX(mainDiv.style.width) || 500,
        height: removePX(mainDiv.style.height) || 150,
        children,
    };
}
