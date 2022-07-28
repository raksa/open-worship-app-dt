import { CSSProperties } from 'react';
import { anyObjectType, cloneObject } from '../../helper/helpers';
import { HAlignmentEnum, VAlignmentEnum } from './Canvas';
import {
    CanvasItemType,
    tooling2BoxProps, ToolingBoxType,
} from './canvasHelpers';
import CanvasController from './CanvasController';
import SlideItem from '../../slide-list/SlideItem';
import FileSource from '../../helper/FileSource';

export function genTextDefaultBoxStyle(width: number = 700,
    height: number = 400): CanvasItemPropsType {
    return {
        top: 279,
        left: 356,
        zIndex: 2,
        backgroundColor: 'rgba(255, 0, 255, 0.39)',
        width,
        height,
        rotate: 0,
        horizontalAlignment: HAlignmentEnum.Center,
        verticalAlignment: VAlignmentEnum.Center,
        type: 'text',
    };
}

export type CanvasItemPropsType = {
    top: number,
    left: number,
    rotate: number,
    width: number,
    height: number,
    horizontalAlignment: HAlignmentEnum,
    verticalAlignment: VAlignmentEnum,
    backgroundColor: string,
    zIndex: number,
    type: CanvasItemType,
};
export default class CanvasItem<T extends CanvasItemPropsType> {
    static _objectId = 0;
    _objectId: number;
    props: T;
    _isSelected: boolean;
    _isControlling: boolean;
    _isEditing: boolean;
    id: number;
    slideItemId: number;
    fileSource: FileSource;
    constructor(id: number, canvasController: CanvasController,
        props: T) {
        this._objectId = CanvasItem._objectId++;
        this.id = id;
        const {
            id: slideItemId,
            fileSource,
        } = canvasController.slideItem;
        this.slideItemId = slideItemId;
        this.fileSource = fileSource;
        this.props = props;
        this._isSelected = false;
        this._isControlling = false;
        this._isEditing = false;
    }
    get isTypeAudio() {
        return this.props.type === 'audio';
    }
    get isTypeImage() {
        return this.props.type === 'image';
    }
    get isTypeVideo() {
        return this.props.type === 'video';
    }
    get isTypeText() {
        return this.props.type === 'text';
    }
    get isTypeBible() {
        return this.props.type === 'bible';
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(b: boolean) {
        this._isSelected = b;
        this.canvasController?.fireSelectEvent(this);
        this.isControlling = b;
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
    static genStyle(_props: CanvasItemPropsType) {
        throw new Error('Method not implemented.');
    }
    getStyle(): CSSProperties {
        throw new Error('Method not implemented.');
    }
    static genBoxStyle(props: CanvasItemPropsType): CSSProperties {
        const style: CSSProperties = {
            top: `${props.top}px`,
            left: `${props.left}px`,
            transform: `rotate(${props.rotate}deg)`,
            width: `${props.width}px`,
            height: `${props.height}px`,
            position: 'absolute',
            zIndex: props.zIndex,
        };
        return style;
    }
    getBoxStyle(): CSSProperties {
        return CanvasItem.genBoxStyle(this.props);
    }
    toJson(): anyObjectType {
        return cloneObject(this.props);
    }
    static propsFromJson(json: { [key: string]: any }): CanvasItemPropsType {
        return {
            top: json['top'],
            left: json['left'],
            rotate: json['rotate'],
            width: json['width'],
            height: json['height'],
            horizontalAlignment: json['horizontalAlignment'],
            verticalAlignment: json['verticalAlignment'],
            backgroundColor: json['backgroundColor'],
            zIndex: json['zIndex'],
            type: json['type'],
        };
    }
    static fromJson(_canvasController: CanvasController, _json: object): CanvasItem<any> {
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
        if (boxData?.rotate) {
            newProps.rotate = boxData.rotate;
        }
        if (boxData?.backgroundColor) {
            newProps.backgroundColor = boxData.backgroundColor;
        }
        this.applyProps(newProps);
    }
    applyProps(props: anyObjectType) {
        const propsAny = this.props as any;
        Object.entries(props).forEach(([key, value]) => {
            propsAny[key] = value;
        });
        this.canvasController?.fireUpdateEvent();
    }
    clone(): CanvasItem<T> | null {
        const canvasController = this.canvasController;
        if (canvasController === null) {
            return null;
        }
        const item = this.constructor(canvasController, this.toJson());
        item.id = -1;
        return item;
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
