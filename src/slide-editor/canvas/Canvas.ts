import { removePX } from '../../helper/helpers';
import SlideItem from '../../slide-list/SlideItem';
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

type CanvasPropsType = {
    width: number, height: number,
    children: CanvasItem[],
};
export default class Canvas {
    static _objectId = 0;
    _objectId: number;
    props: CanvasPropsType;
    constructor(props: CanvasPropsType) {
        this._objectId = CanvasItem._objectId++;
        this.props = props;
    }
    get width() {
        return this.props.width;
    }
    get height() {
        return this.props.height;
    }
    get canvasItems() {
        return this.props.children;
    }
    set canvasItems(canvasItems: CanvasItem[]) {
        this.props.children.forEach((item)=>{
            item.slideItem = null;
        });
        this.props.children = canvasItems;
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
    static fromHtml(canvasController: CanvasController,
        html: string): Canvas {
        const div = document.createElement('div');
        div.innerHTML = html;
        const mainDiv = div.firstChild as HTMLDivElement;
        const children = Array.from(mainDiv.children).map((ele): CanvasItem => {
            return CanvasItem.fromHtml(canvasController, ele.outerHTML);
        });
        return new Canvas({
            width: removePX(mainDiv.style.width) || 500,
            height: removePX(mainDiv.style.height) || 150,
            children,
        });
    }
    get html() {
        const div = document.createElement('div');
        const newHtml = `<div style="width: ${this.props.width}px; height: ${this.props.height}px;">` +
            `${this.canvasItems.map((child) => child.htmlString).join('')}</div>`;
        div.innerHTML = newHtml;
        return div.firstChild as HTMLDivElement;
    }
    get htmlString() {
        return this.html.outerHTML;
    }
    static fromSlideItem(canvasController: CanvasController,
        slideItem: SlideItem) {
        return Canvas.fromHtml(canvasController, slideItem.html);
    }
}
