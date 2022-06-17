import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../others/ColorPicker';
import {
    getRotationDeg, removePX,
} from '../helper/helpers';
import {
    HAlignmentEnum, VAlignmentEnum,
} from './HTML2React';

export default class HTML2ReactChild {
    text: string;
    fontSize: number;
    color: string;
    top: number;
    left: number;
    rotate: number;
    width: number;
    height: number;
    horizontalAlignment: HAlignmentEnum;
    verticalAlignment: VAlignmentEnum;
    backgroundColor: string;
    zIndex: number;
    constructor({ text, fontSize, color, top, left, rotate, width, height,
        horizontalAlignment, verticalAlignment, backgroundColor, zIndex }: {
            text: string, fontSize: number, color: string, top: number, left: number,
            rotate: number, width: number, height: number, horizontalAlignment: HAlignmentEnum,
            verticalAlignment: VAlignmentEnum, backgroundColor: string, zIndex: number,
        }) {
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
        this.top = top;
        this.left = left;
        this.rotate = rotate;
        this.width = width;
        this.height = height;
        this.horizontalAlignment = horizontalAlignment;
        this.verticalAlignment = verticalAlignment;
        this.backgroundColor = backgroundColor;
        this.zIndex = zIndex;
    }
    get style() {
        const style: CSSProperties = {
            display: 'flex',
            fontSize: `${this.fontSize}px`,
            color: this.color,
            alignItems: this.verticalAlignment,
            justifyContent: this.horizontalAlignment,
            backgroundColor: this.backgroundColor,
        };
        return style;
    }
    get normalStyle() {
        const style: CSSProperties = {
            top: `${this.top}px`, left: `${this.left}px`,
            transform: `rotate(${this.rotate}deg)`,
            width: `${this.width}px`,
            height: `${this.height}px`,
            position: 'absolute',
            zIndex: this.zIndex,
        };
        return style;
    }
    get html() {
        const div = document.createElement('div');
        div.innerHTML = this.text;
        const targetStyle = div.style as any;
        const style = { ...this.style, ...this.normalStyle } as any;
        Object.keys(style).forEach((k) => {
            targetStyle[k] = style[k];
        });
        return div;
    }
    get htmlString() {
        return this.html.outerHTML;
    }
    static parseHTML(html: string) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const element = div.firstChild as HTMLDivElement;
        const style = element.style;
        return new HTML2ReactChild({
            text: element.innerHTML.split('<br>').join('\n'),
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
        });
    }
}
