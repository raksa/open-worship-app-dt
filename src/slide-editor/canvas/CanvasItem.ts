import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../../others/ColorPicker';
import { getRotationDeg, removePX } from '../../helper/helpers';
import { HAlignmentEnum, VAlignmentEnum } from './Canvas';
import {
    CanvasItemType,
    tooling2BoxProps, ToolingBoxType,
} from './canvasHelpers';
import CanvasController from './CanvasController';
import SlideItem from '../../slide-list/SlideItem';
import FileSource from '../../helper/FileSource';

export type CanvasItemPropsType = {
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
    get isTypeAudio() {
        return this.type === 'audio';
    }
    get isTypeImage() {
        return this.type === 'image';
    }
    get isTypeVideo() {
        return this.type === 'video';
    }
    get isTypeText() {
        return this.type === 'text';
    }
    get type(): CanvasItemType {
        throw new Error('Method not implemented.');
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
    getStyle(): CSSProperties {
        throw new Error('Method not implemented.');
    }
    getBoxStyle(): CSSProperties {
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
        const style = {
            ...this.getStyle(),
            ...this.getBoxStyle(),
        } as any;
        Object.keys(style).forEach((k) => {
            targetStyle[k] = style[k];
        });
        return div;
    }
    get htmlString() {
        return this.html.outerHTML;
    }
    static htmlToBoxProps(htmlString: string): CanvasItemPropsType {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstChild as HTMLDivElement;
        const style = element.style;
        return {
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
    }
    static fromHtml(_canvasController: CanvasController, _htmlString: string): CanvasItem {
        throw new Error('Method not implemented.');
    }
    applyBoxData(boxData: ToolingBoxType) {
        const canvasController = this.canvasController;
        if (canvasController === null) {
            return;
        }
        const canvas = canvasController.canvas;
        const boxProps = tooling2BoxProps(boxData, {
            width: this.props.width,
            height: this.props.height,
            parentWidth: canvas.width,
            parentHeight: canvas.height,
        });
        const newProps = {
            ...boxData, ...boxProps,
        };
        // TODO: move rotate to box
        if (boxData?.rotate) {
            newProps.rotate = boxData.rotate;
        }
        if (boxData?.backgroundColor) {
            newProps.backgroundColor = boxData.backgroundColor;
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
    clone(): CanvasItem | null {
        throw new Error('Method not implemented.');
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
    static genDefaultHtmlString(_width: number = 700, _height: number = 400): string {
        throw new Error('Method not implemented.');
    }
}
