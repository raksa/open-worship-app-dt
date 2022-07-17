import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../../others/ColorPicker';
import { getAppInfo, getRotationDeg, removePX } from '../../helper/helpers';
import { HAlignmentEnum, VAlignmentEnum } from './Canvas';
import { ToolingType, tooling2BoxProps } from './canvasHelpers';
import CanvasController from './CanvasController';
import SlideItem from '../../slide-list/SlideItem';
import FileSource from '../../helper/FileSource';

type CanvasItemPropsType = {
    text: string, color: string,
    fontSize: number, fontFamily: string,
    top: number, left: number,
    rotate: number, width: number, height: number,
    horizontalAlignment: HAlignmentEnum,
    verticalAlignment: VAlignmentEnum,
    backgroundColor: string, zIndex: number,
};
export default class CanvasItem {
    static _objectId = 0;
    _objectId: number;
    props: CanvasItemPropsType;
    _isSelected: boolean;
    _isControlling: boolean;
    _isEditing: boolean;
    id: number;
    slideItemId: number;
    fileSource: FileSource;
    constructor(id: number, slideItemId: number, fileSource: FileSource,
        props: CanvasItemPropsType) {
        this._objectId = CanvasItem._objectId++;
        this.id = id;
        this.slideItemId = slideItemId;
        this.fileSource = fileSource;
        this.props = props;
        this._isSelected = false;
        this._isControlling = false;
        this._isEditing = false;
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(b: boolean) {
        this._isSelected = b;
        this.canvasController?.fireSelectEvent(this);
    }
    get isControlling() {
        return this._isControlling;
    }
    set isControlling(b: boolean) {
        this._isControlling = b;
        this.canvasController?.fireControlEvent(this);
    }
    get isEditing() {
        return this._isEditing;
    }
    set isEditing(b: boolean) {
        this._isEditing = b;
        this.canvasController?.fireEditEvent(this);
    }
    get canvasController() {
        const key = SlideItem.genKeyByFileSource(this.fileSource, this.slideItemId);
        const slideItem = SlideItem.getByKey(key);
        if (slideItem === null) {
            return null;
        }
        return CanvasController.getInstant(slideItem);
    }
    get style() {
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
    get normalStyle() {
        const style: CSSProperties = {
            top: `${this.props.top}px`,
            left: `${this.props.left}px`,
            transform: `rotate(${this.props.rotate}deg)`,
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            position: 'absolute',
            zIndex: this.props.zIndex,
        };
        return style;
    }
    get html() {
        const div = document.createElement('div');
        div.id = `${this.id}`;
        div.innerHTML = this.props.text;
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
    static fromHtml(canvasController: CanvasController, htmlString: string) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstChild as HTMLDivElement;
        const style = element.style;
        const props = {
            text: element.innerHTML.split('<br>').join('\n'),
            fontSize: removePX(style.fontSize) || 30,
            fontFamily: style.fontFamily.replace(/"/g, '') || '',
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
        let id = +element.id;
        if (!element.id || isNaN(id)) {
            id = -1;
            props.text = 'Invalid canvas item id';
        }
        const slideItem = canvasController.slideItem;
        return new CanvasItem(id, slideItem.id, slideItem.fileSource, props);
    }
    applyToolingData(data: ToolingType) {
        const { text: text = {}, box: box = {} } = data;
        const canvasController = this.canvasController;
        if (canvasController === null) {
            return;
        }
        const canvas = canvasController.canvas;
        const boxProps = tooling2BoxProps(data, {
            width: this.props.width,
            height: this.props.height,
            parentWidth: canvas.width,
            parentHeight: canvas.height,
        });
        const newProps = {
            ...text, ...box, ...boxProps,
        };
        if (box?.rotate) {
            newProps.rotate = box.rotate;
        }
        if (box?.backgroundColor) {
            newProps.backgroundColor = box.backgroundColor;
        }
        this.applyProps(newProps);
    }
    applyProps(props: { [key: string]: any }) {
        const propsAny = this.props as any;
        Object.entries(props).forEach(([key, value]) => {
            propsAny[key] = value;
        });
        this.canvasController?.syncHtmlString();
        this.canvasController?.fireUpdateEvent();
    }
    clone() {
        const canvasController = this.canvasController;
        if (canvasController === null) {
            return null;
        }
        return CanvasItem.fromHtml(canvasController, this.htmlString);
    }
    static genDefaultHtmlString(width: number = 700, height: number = 400) {
        return '<div id="0" class="box-editor pointer " style="top: 279px; left: 356px; transform: rotate(0deg); '
            + `width: ${width}px; height: ${height}px; z-index: 2; display: flex; font-size: 60px; `
            + 'color: rgb(255, 254, 254); align-items: center; justify-content: center; '
            + `background-color: rgba(255, 0, 255, 0.39); position: absolute;">${getAppInfo().name}</div>`;
    }
    static genKey(canvasController: CanvasController, id: number) {
        return `${canvasController.slideItem.key}#${id}`;
    }
    static extractKey(key: string) {
        const arr = key.split('#');
        return {
            slideItemKey: arr[0],
            id: +arr[1],
        };
    }
}
