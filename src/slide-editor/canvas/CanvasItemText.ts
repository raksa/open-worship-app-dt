import { CSSProperties } from 'react';
import CanvasController from './CanvasController';
import CanvasItem, { CanvasItemPropsType } from './CanvasItem';
import { CanvasItemType } from './canvasHelpers';
import { HAlignmentEnum, VAlignmentEnum } from './Canvas';
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
};
export type CanvasItemTextPropsType = CanvasItemPropsType & TextPropsType;
export type ToolingTextType = {
    color?: string,
    fontSize?: number,
    fontFamily?: string,
    horizontalAlignment?: HAlignmentEnum,
    verticalAlignment?: VAlignmentEnum,
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
    static fromJson(canvasController: CanvasController,
        json: anyObjectType) {
        return new CanvasItemText(json.id, canvasController, {
            text: json.text,
            color: json.color,
            fontSize: json.fontSize,
            fontFamily: json.fontFamily,
            ...super.propsFromJson(json),
        });
    }
    applyTextData(textData: ToolingTextType) {
        this.applyProps(textData);
    }
}
