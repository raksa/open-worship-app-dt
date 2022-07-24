import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../../others/ColorPicker';
import { getAppInfo, removePX } from '../../helper/helpers';
import CanvasController from './CanvasController';
import FileSource from '../../helper/FileSource';
import CanvasItem, { CanvasItemPropsType } from './CanvasItem';
import { CanvasItemType, ToolingTextType } from './canvasHelpers';
import img404 from './404.png';

type CanvasItemImagePropsType = CanvasItemPropsType & {
    fileSource: FileSource | null,
};
export default class CanvasItemImage extends CanvasItem {
    props: CanvasItemImagePropsType;
    constructor(id: number, slideItemId: number, fileSource: FileSource,
        props: CanvasItemImagePropsType) {
        super(id, slideItemId, fileSource, props);
        this.props = props;
    }
    get type(): CanvasItemType {
        return 'image';
    }
    getStyle() {
        return {};
    }
    get html(): HTMLDivElement {
        const div = document.createElement('div');
        div.id = `${this.id}`;
        const src = this.props.fileSource?.src || img404;
        div.innerHTML = `<img src="${src}"></img>`;
        const targetStyle = div.style as any;
        const style = {
            ...this.getStyle(),
            ...this.getBoxStyle(),
        } as any;
        Object.keys(style).forEach((k) => {
            targetStyle[k] = style[k];
        });
        return div;
    }
    static fromHtml(canvasController: CanvasController, htmlString: string) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstChild as HTMLDivElement;
        const src = (element.firstChild as HTMLImageElement)?.getAttribute('src');
        const imageProps = {
            fileSource: src ? FileSource.genFileSource(src) : null,
        };
        let id = +element.id;
        if (!element.id || isNaN(id)) {
            id = -1;
            imageProps.fileSource = null;
        }
        const boxProps = super.htmlToBoxProps(htmlString);
        const slideItem = canvasController.slideItem;
        return new CanvasItemImage(id, slideItem.id, slideItem.fileSource, {
            ...imageProps,
            ...boxProps,
        });
    }
    applyTextData(text: ToolingTextType) {
        this.applyProps(text);
    }
    clone(): CanvasItemImage | null {
        const canvasController = this.canvasController;
        if (canvasController === null) {
            return null;
        }
        return CanvasItemImage.fromHtml(canvasController, this.htmlString);
    }
    static genDefaultHtmlString(width: number = 700, height: number = 400) {
        return '<div id="0" class="box-editor pointer " style="top: 279px; left: 356px; transform: rotate(0deg); '
            + `width: ${width}px; height: ${height}px; z-index: 2; display: flex; font-size: 60px; `
            + 'color: rgb(255, 254, 254); align-items: center; justify-content: center; '
            + `background-color: rgba(255, 0, 255, 0.39); position: absolute;">${getAppInfo().name}</div>`;
    }
    static htmlToType(htmlString: string): CanvasItemType | null {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const anyChild = div.firstChild as any;
        if (anyChild.getAttribute && anyChild.getAttribute('src')) {
            return 'image';
        }
        return null;
    }
}
