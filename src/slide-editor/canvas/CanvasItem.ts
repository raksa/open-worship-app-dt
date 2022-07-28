import { CSSProperties } from 'react';
import { anyObjectType, cloneObject } from '../../helper/helpers';
import { HAlignmentType, VAlignmentType } from './Canvas';
import {
    CanvasItemType,
    tooling2BoxProps, ToolingBoxType,
} from './canvasHelpers';
import CanvasController from './CanvasController';

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
            type: json['type'],
        };
    }
    static fromJson(_canvasController: CanvasController, _json: object): CanvasItem<any> {
        throw new Error('Method not implemented.');
    }
    applyBoxData(canvasController: CanvasController, boxData: ToolingBoxType) {
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
        this.applyProps(canvasController, newProps);
    }
    applyProps(canvasController: CanvasController, props: anyObjectType) {
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
    static validate(json: anyObjectType) {
        if (!['text', 'image', 'video', 'audio', 'bible'].includes(json.type) ||
            typeof json.top !== 'number' ||
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
