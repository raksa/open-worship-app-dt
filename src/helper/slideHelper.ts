import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../others/ColorPicker';
import SlideItemThumb from '../slide-presenting/SlideItemThumb';
import { readFile } from './fileHelper';
import { getAppInfo, getRotationDeg, removePX } from './helpers';

export type SlidePresentType = {
    items: SlideItemThumb[]
};

export function validateMeta(meta: any) {
    try {
        if (meta.fileVersion === 1 && meta.app === 'OpenWorship') {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validateSlideItemThumb(item: any) {
    try {
        if (item.html && item.id) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validateSlide(json: any) {
    try {
        if (!json.items.length ||
            !(json.items as any[]).every((item) => validateSlideItemThumb(item))) {
            return false;
        }
        if (!validateMeta(json.metadata)) {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
}

export const getDefaultBoxHTML = (width: number = 700, height: number = 400) =>
    '<div class="box-editor pointer " style="top: 279px; left: 356px; transform: rotate(0deg); '
    + `width: ${width}px; height: ${height}px; z-index: 2; display: flex; font-size: 60px; `
    + 'color: rgb(255, 254, 254); align-items: center; justify-content: center; '
    + `background-color: rgba(255, 0, 255, 0.39); position: absolute;">${getAppInfo().name}</div>`;

export function defaultSlide(width: number, height: number) {
    return {
        metadata: {
            fileVersion: 1,
            app: 'OpenWorship',
            initDate: (new Date()).toJSON(),
        },
        items: [
            {
                id: '0', // TODO: set width and height for present screen
                html: `<div style="width: ${width}px; height: ${height}px;">`
                    + getDefaultBoxHTML()
                    + '</div>',
            },
        ],
    };
}

const slideDataCache = new Map<string, SlidePresentType>();
export function getSlideDataByFilePathNoCache(filePath: string) {
    try {
        const str = readFile(filePath);
        if (str !== null) {
            const json = JSON.parse(str);
            if (validateSlide(json)) {
                const data = json as SlidePresentType;
                data.items = data.items.map((item) => {
                    return new SlideItemThumb(item.id, item.html, filePath);
                });
                return data;
            }
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}
export function getSlideDataByFilePath(filePath: string) {
    if (slideDataCache.has(filePath)) {
        return slideDataCache.get(filePath) as SlidePresentType;
    } else {
        const data = getSlideDataByFilePathNoCache(filePath);
        if (data !== null) {
            slideDataCache.set(filePath, data);
        }
        return data;
    }
}

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
export class HTML2ReactChild {
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
export class HTML2React {
    width: number;
    height: number;
    children: HTML2ReactChild[];
    constructor({ width, height, children }: {
        width: number, height: number, children: HTML2ReactChild[],
    }) {
        this.width = width;
        this.height = height;
        this.children = children;
    }
    static parseHTML(html: string): HTML2React {
        const div = document.createElement('div');
        div.innerHTML = html;
        const mainDiv = div.firstChild as HTMLDivElement;
        const children = Array.from(mainDiv.children).map((ele): HTML2ReactChild => {
            return HTML2ReactChild.parseHTML(ele.outerHTML);
        });
        return new HTML2React({
            width: removePX(mainDiv.style.width) || 500,
            height: removePX(mainDiv.style.height) || 150,
            children,
        });
    }
    get html() {
        const div = document.createElement('div');
        const newHtml = `<div style="width: ${this.width}px; height: ${this.height}px;">` +
            `${this.children.map((child) => child.htmlString).join('')}</div>`;
        div.innerHTML = newHtml;
        return div.firstChild as HTMLDivElement;
    }
    get htmlString() {
        return this.html.outerHTML;
    }
}
