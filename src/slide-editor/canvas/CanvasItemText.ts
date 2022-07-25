import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../../others/ColorPicker';
import { getAppInfo, removePX } from '../../helper/helpers';
import CanvasController from './CanvasController';
import FileSource from '../../helper/FileSource';
import CanvasItem, { CanvasItemPropsType } from './CanvasItem';
import { CanvasItemType, ToolingTextType } from './canvasHelpers';

type CanvasItemTextPropsType = CanvasItemPropsType & {
    text: string,
    color: string,
    fontSize: number,
    fontFamily: string,
};
export default class CanvasItemText extends CanvasItem {
    props: CanvasItemTextPropsType;
    constructor(id: number, slideItemId: number, fileSource: FileSource,
        props: CanvasItemTextPropsType) {
        super(id, slideItemId, fileSource, props);
        this.props = props;
    }
    get type(): CanvasItemType {
        return 'text';
    }
    getStyle() {
        const style: CSSProperties = {
            display: 'flex',
            fontSize: `${this.props.fontSize}px`,
            fontFamily: this.props.fontFamily,
            color: this.props.color,
            alignItems: this.props.verticalAlignment,
            justifyContent: this.props.horizontalAlignment,
            backgroundColor: this.props.backgroundColor,
        };
        return style;
    }
    get html(): HTMLDivElement {
        const div = document.createElement('div');
        div.id = `${this.id}`;
        div.innerHTML = this.props.text;
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
        const style = element.style;
        const textProps = {
            text: element.innerHTML.split('<br>').join('\n'),
            fontSize: removePX(style.fontSize) || 30,
            fontFamily: style.fontFamily.replace(/"/g, '') || '',
            color: style.color || BLACK_COLOR,
        };
        let id = +element.id;
        if (!element.id || isNaN(id)) {
            id = -1;
            textProps.text = 'Invalid canvas item id';
        }
        const boxProps = super.htmlToBoxProps(htmlString);
        const slideItem = canvasController.slideItem;
        return new CanvasItemText(id, slideItem.id, slideItem.fileSource, {
            ...textProps,
            ...boxProps,
        });
    }
    applyTextData(text: ToolingTextType) {
        this.applyProps(text);
    }
    clone(): CanvasItemText | null {
        const canvasController = this.canvasController;
        if (canvasController === null) {
            return null;
        }
        return CanvasItemText.fromHtml(canvasController, this.htmlString);
    }
    static genDefaultHtmlString(width: number = 700, height: number = 400) {
        return '<div id="0" '
            + 'style="position: absolute; top: 279px; left: 356px; '
            + 'transform: rotate(0deg); z-index: 2; '
            + 'background-color: rgba(255, 0, 255, 0.39); '
            + `width: ${width}px; height: ${height}px; `
            + 'display: flex; font-size: 60px; color: rgb(255, 254, 254); '
            + 'align-items: center; justify-content: center; '
            + `">
                ${getAppInfo().name}
            </div>`;
    }
    static htmlToType(htmlString: string) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstChild as HTMLDivElement;
        return element.innerText ? 'text' : null;
    }
}
