import FileSource from '../../helper/FileSource';
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
    canvasItems: CanvasItem[],
};
export default class Canvas {
    static _objectId = 0;
    _objectId: number;
    props: CanvasPropsType;
    slideItemId: number;
    fileSource: FileSource;
    constructor(slideItemId: number, fileSource: FileSource,
        props: CanvasPropsType) {
        this._objectId = CanvasItem._objectId++;
        this.props = props;
        this.slideItemId = slideItemId;
        this.fileSource = fileSource;
    }
    get maxItemId() {
        if (this.canvasItems.length) {
            return Math.max.apply(Math, this.canvasItems.map((item) => item.id));
        }
        return 0;
    }
    get selectedCanvasItems() {
        return this.canvasItems.filter((item) => item.isSelected);
    }
    get newCanvasItems() {
        return [...this.canvasItems];
    }
    get width() {
        return this.props.width;
    }
    get height() {
        return this.props.height;
    }
    get canvasItems() {
        return this.props.canvasItems;
    }
    set canvasItems(canvasItems: CanvasItem[]) {
        this.props.canvasItems = canvasItems;
        this.canvasController?.syncHtmlString();
        this.canvasController?.fireUpdateEvent();
    }
    get canvasController() {
        const key = SlideItem.genKeyByFileSource(this.fileSource, this.slideItemId);
        const slideItem = SlideItem.getByKey(key);
        if (slideItem === null) {
            return null;
        }
        return CanvasController.getInstant(slideItem);
    }
    static parseHtmlDim(htmlString: string) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const mainDiv = div.firstChild as HTMLDivElement;
        return {
            width: removePX(mainDiv.style.width) || 500,
            height: removePX(mainDiv.style.height) || 150,
            htmlString: htmlString,
        };
    }
    static fromHtml(canvasController: CanvasController,
        htmlString: string): Canvas {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const mainDiv = div.firstChild as HTMLDivElement;
        const children = Array.from(mainDiv.children).map((ele): CanvasItem => {
            return CanvasItem.fromHtml(canvasController, ele.outerHTML);
        });
        const slideItem = canvasController.slideItem;
        return new Canvas(slideItem.id, slideItem.fileSource, {
            width: removePX(mainDiv.style.width) || 500,
            height: removePX(mainDiv.style.height) || 150,
            canvasItems: children,
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
        return Canvas.fromHtml(canvasController, slideItem.htmlString);
    }
}
