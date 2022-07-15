import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../../others/ColorPicker';
import { getRotationDeg, removePX } from '../../helper/helpers';
import { HAlignmentEnum, VAlignmentEnum } from './Canvas';
import { ToolingType, tooling2BoxProps } from './canvasHelpers';
import CanvasController from './CanvasController';
import SlideItem from '../../slide-list/SlideItem';

type CanvasItemPropsType = {
    text: string, fontSize: number, color: string,
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
    _isControlling: boolean;
    _isEditing: boolean;
    slideItem: SlideItem | null;
    constructor(canvasController: CanvasController,
        props: CanvasItemPropsType) {
        this._objectId = CanvasItem._objectId++;
        this.props = props;
        this._isControlling = false;
        this._isEditing = false;
        this.slideItem = canvasController.slideItem;
    }
    get isSelected() {
        return this.isControlling;
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
        if (this.slideItem === null) {
            return null;
        }
        return CanvasController.getInstant(this.slideItem);
    }
    get style() {
        const style: CSSProperties = {
            display: 'flex',
            fontSize: `${this.props.fontSize}px`,
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
    static fromHtml(canvasController: CanvasController, html: string) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const element = div.firstChild as HTMLDivElement;
        const style = element.style;
        return new CanvasItem(canvasController, {
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
        newProps.rotate = box?.rotate ?? this.props.rotate;
        newProps.backgroundColor = box?.backgroundColor ??
            this.props.backgroundColor;
        this.applyProps(newProps);
    }
    applyProps(props: { [key: string]: any }) {
        const propsAny = this.props as any;
        Object.entries(props).forEach(([key, value]) => {
            propsAny[key] = value;
        });
        this.canvasController?.fireUpdateEvent();
    }
    clone(canvasController: CanvasController) {
        return CanvasItem.fromHtml(canvasController, this.htmlString);
    }
}
