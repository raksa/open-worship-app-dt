import { CSSProperties } from 'react';
import { anyObjectType, cloneObject } from '../../helper/helpers';
import { HAlignmentType, VAlignmentType } from './Canvas';
import { canvasController } from './CanvasController';
import {
    CanvasItemType,
    tooling2BoxProps, ToolingBoxType,
} from './canvasHelpers';

export function genTextDefaultBoxStyle(width: number = 700,
    height: number = 400): CanvasItemPropsType {
    return {
        top: 279,
        left: 356,
        backgroundColor: 'rgba(255, 0, 255, 0.39)',
        width,
        height,
        rotate: 0,
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
        type: 'text',
    };
}

export type CanvasItemPropsType = {
    top: number,
    left: number,
    rotate: number,
    width: number,
    height: number,
    horizontalAlignment: HAlignmentType,
    verticalAlignment: VAlignmentType,
    backgroundColor: string,
    type: CanvasItemType,
};
export default class CanvasItem<T extends CanvasItemPropsType> {
    static _objectId = 0;
    _objectId: number;
    props: T;
    isSelected: boolean;
    isControlling: boolean;
    isEditing: boolean;
    id: number;
    constructor(id: number, props: T) {
        this._objectId = CanvasItem._objectId++;
        this.id = id;
        this.props = props;
        this.isSelected = false;
        this.isControlling = false;
        this.isEditing = false;
    }
    static checkIsTypeAudio(type: string) {
        return type === 'audio';
    }
    get isTypeAudio() {
        // TODO: implement CameraItemAudio
        return CanvasItem.checkIsTypeAudio(this.props.type);
    }
    static checkIsTypeImage(type: string) {
        return type === 'image';
    }
    get isTypeImage() {
        return CanvasItem.checkIsTypeImage(this.props.type);
    }
    static checkIsTypeVideo(type: string) {
        return type === 'video';
    }
    get isTypeVideo() {
        // TODO: implement CameraItemVideo
        return CanvasItem.checkIsTypeVideo(this.props.type);
    }
    static checkIsTypeText(type: string) {
        return type === 'text';
    }
    get isTypeText() {
        return CanvasItem.checkIsTypeText(this.props.type);
    }
    static checkIsTypeBible(type: string) {
        return type === 'bible';
    }
    get isTypeBible() {
        return CanvasItem.checkIsTypeBible(this.props.type);
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
        };
        return style;
    }
    getBoxStyle(): CSSProperties {
        return CanvasItem.genBoxStyle(this.props);
    }
    toJson() {
        return {
            top: this.props.top,
            left: this.props.left,
            rotate: this.props.rotate,
            width: this.props.width,
            height: this.props.height,
            horizontalAlignment: this.props.horizontalAlignment as string,
            verticalAlignment: this.props.verticalAlignment as string,
            backgroundColor: this.props.backgroundColor,
            type: this.props.type,
        };
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
            type: json['type'],
        };
    }
    static fromJson(_json: object): CanvasItem<any> {
        throw new Error('Method not implemented.');
    }
    applyBoxData(boxData: ToolingBoxType) {
        const canvas = canvasController.canvas;
        if (canvas === null) {
            return;
        }
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
        canvasController.fireUpdateEvent();
    }
    clone() {
        const newItem = cloneObject(this);
        newItem.id = -1;
        return newItem;
    }
    async initProps() {
        return;
    }
    static validate(json: anyObjectType) {
        if (typeof json.top !== 'number' ||
            typeof json.left !== 'number' ||
            typeof json.rotate !== 'number' ||
            typeof json.width !== 'number' ||
            typeof json.height !== 'number' ||
            !['left', 'center', 'right'].includes(json.horizontalAlignment) ||
            !['start', 'center', 'end'].includes(json.verticalAlignment) ||
            typeof json.backgroundColor !== 'string'
        ) {
            console.log(json);
            throw new Error('Invalid canvas item data');
        }
    }
}
