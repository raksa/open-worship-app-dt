import { CSSProperties } from 'react';
import { AnyObjectType, cloneObject } from '../../helper/helpers';
import { HAlignmentType, VAlignmentType } from './Canvas';
import { canvasController } from './CanvasController';
import {
    CanvasItemType,
    tooling2BoxProps, ToolingBoxType,
} from './canvasHelpers';

export function genTextDefaultBoxStyle(width: number = 700,
    height: number = 400): CanvasItemPropsType {
    return {
        id: -1,
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
    id: number,
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
export default abstract class CanvasItem<T extends CanvasItemPropsType> {
    static _objectId = 0;
    _objectId: number;
    props: T;
    isSelected: boolean;
    isControlling: boolean;
    isEditing: boolean;
    constructor(props: T) {
        this._objectId = CanvasItem._objectId++;
        this.props = props;
        this.isSelected = false;
        this.isControlling = false;
        this.isEditing = false;
    }
    get id() {
        return this.props.id;
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
    abstract getStyle(): CSSProperties;
    static genBoxStyle(props: CanvasItemPropsType): CSSProperties {
        const style: CSSProperties = {
            display: 'flex',
            top: `${props.top}px`,
            left: `${props.left}px`,
            transform: `rotate(${props.rotate}deg)`,
            width: `${props.width}px`,
            height: `${props.height}px`,
            position: 'absolute',
            backgroundColor: props.backgroundColor,
        };
        return style;
    }
    getBoxStyle(): CSSProperties {
        return CanvasItem.genBoxStyle(this.props);
    }
    static fromJson(_json: object): CanvasItem<any> {
        throw new Error('Method not implemented.');
    }
    applyBoxData(boxData: ToolingBoxType) {
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
    applyProps(props: AnyObjectType) {
        const propsAny = this.props as any;
        Object.entries(props).forEach(([key, value]) => {
            propsAny[key] = value;
        });
        canvasController.fireUpdateEvent();
    }
    clone() {
        const newItem = cloneObject(this);
        newItem.props.id = -1;
        return newItem;
    }
    toJson(): CanvasItemPropsType {
        return this.props;
    }
    static validate(json: AnyObjectType) {
        if (typeof json.id !== 'number' ||
            typeof json.top !== 'number' ||
            typeof json.left !== 'number' ||
            typeof json.rotate !== 'number' ||
            typeof json.width !== 'number' ||
            typeof json.height !== 'number' ||
            !['left', 'center', 'right'].includes(json.horizontalAlignment) ||
            !['top', 'center', 'bottom'].includes(json.verticalAlignment) ||
            typeof json.backgroundColor !== 'string' ||
            typeof json.type !== 'string'
        ) {
            console.log(json);
            throw new Error('Invalid canvas item data');
        }
    }
}
