import { removePX } from '../helper/helpers';
import SlideItem from '../slide-list/SlideItem';
import CanvasController from './CanvasController';
import CanvasItem from './CanvasItem';

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

export default class Canvas {
    width: number;
    height: number;
    canvasItems: CanvasItem[];
    constructor({ width, height, children }: {
        width: number, height: number, children: CanvasItem[],
    }) {
        this.width = width;
        this.height = height;
        this.canvasItems = children;
    }
    static parseHtmlDim(html: string) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const mainDiv = div.firstChild as HTMLDivElement;
        return {
            width: removePX(mainDiv.style.width) || 500,
            height: removePX(mainDiv.style.height) || 150,
            htmlString: html,
        };
    }
    static parseHtml(canvasController: CanvasController,
        html: string): Canvas {
        const div = document.createElement('div');
        div.innerHTML = html;
        const mainDiv = div.firstChild as HTMLDivElement;
        const children = Array.from(mainDiv.children).map((ele): CanvasItem => {
            return CanvasItem.parseHtml(canvasController, ele.outerHTML);
        });
        return new Canvas({
            width: removePX(mainDiv.style.width) || 500,
            height: removePX(mainDiv.style.height) || 150,
            children,
        });
    }
    get html() {
        const div = document.createElement('div');
        const newHtml = `<div style="width: ${this.width}px; height: ${this.height}px;">` +
            `${this.canvasItems.map((child) => child.htmlString).join('')}</div>`;
        div.innerHTML = newHtml;
        return div.firstChild as HTMLDivElement;
    }
    get htmlString() {
        return this.html.outerHTML;
    }
    static fromSlideItem(canvasController: CanvasController,
        slideItem: SlideItem) {
        return Canvas.parseHtml(canvasController, slideItem.html);
    }
    destroy() {
        this.canvasItems.forEach((item) => {
            item.destroy();
        });
    }
}
