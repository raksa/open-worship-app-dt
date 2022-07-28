import { CSSProperties } from 'react';
import CanvasController from './CanvasController';
import CanvasItem, { CanvasItemPropsType } from './CanvasItem';
import { CanvasItemType } from './canvasHelpers';
import { HAlignmentType, VAlignmentType } from './Canvas';
import { anyObjectType } from '../../helper/helpers';

export function genTextDefaultProps(): TextPropsType {
    return {
        text: '',
        color: 'white',
        fontSize: 60,
        fontFamily: '',
    };
}
export type TextPropsType = {
    text: string,
    color: string,
    fontSize: number,
    fontFamily: string,
    horizontalAlignment?: HAlignmentType,
    verticalAlignment?: VAlignmentType,
};
export type CanvasItemTextPropsType = CanvasItemPropsType & TextPropsType;
export type ToolingTextType = {
    color?: string,
    fontSize?: number,
    fontFamily?: string,
    horizontalAlignment?: HAlignmentType,
    verticalAlignment?: VAlignmentType,
};
export default class CanvasItemText extends CanvasItem<CanvasItemTextPropsType> {
    get type(): CanvasItemType {
        return 'text';
    }
    static genStyle(props: CanvasItemTextPropsType) {
        const style: CSSProperties = {
            display: 'flex',
            fontSize: `${props.fontSize}px`,
            fontFamily: props.fontFamily,
            color: props.color,
            alignItems: props.verticalAlignment,
            justifyContent: props.horizontalAlignment,
            backgroundColor: props.backgroundColor,
        };
        return style;
    }
    getStyle() {
        return CanvasItemText.genStyle(this.props);
    }
    toJson() {
        return {
            text: this.props.text,
            color: this.props.color,
            fontSize: this.props.fontSize,
            fontFamily: this.props.fontFamily,
            ...super.toJson(),
        };
    }
    static fromJson(json: anyObjectType) {
        return new CanvasItemText(json.id, {
            text: json.text,
            color: json.color,
            fontSize: json.fontSize,
            fontFamily: json.fontFamily,
            ...super.propsFromJson(json),
        });
    }
    applyTextData(canvasController: CanvasController,
        textData: ToolingTextType) {
        this.applyProps(canvasController, textData);
    }
    static validate(json: anyObjectType) {
        super.validate(json);
        if (typeof json.text !== 'string' ||
            typeof json.color !== 'string' ||
            typeof json.fontSize !== 'number' ||
            typeof json.fontFamily !== 'string' ||
            !['left', 'center', 'right'].includes(json.horizontalAlignment) ||
            !['start', 'center', 'end'].includes(json.verticalAlignment)
        ) {
            console.log(json);
            throw new Error('Invalid canvas item text data');
        }
    }
}
