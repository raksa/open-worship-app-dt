import { CSSProperties } from 'react';
import CanvasItem, {
    CanvasItemPropsType, genTextDefaultBoxStyle,
} from './CanvasItem';
import { CanvasItemType } from './canvasHelpers';
import { HAlignmentType, VAlignmentType } from './Canvas';
import { AnyObjectType, getAppInfo } from '../../helper/helpers';

export function genTextDefaultProps(): TextPropsType {
    return {
        text: getAppInfo().name,
        color: 'white',
        fontSize: 60,
        fontFamily: '',
        textHorizontalAlignment: 'center',
        textVerticalAlignment: 'center',
    };
}
export type TextPropsType = {
    text: string,
    color: string,
    fontSize: number,
    fontFamily: string,
    textHorizontalAlignment: HAlignmentType,
    textVerticalAlignment: VAlignmentType,
};
export type CanvasItemTextPropsType = CanvasItemPropsType & TextPropsType;
export type ToolingTextType = {
    color?: string,
    fontSize?: number,
    fontFamily?: string,
    textHorizontalAlignment?: HAlignmentType,
    textVerticalAlignment?: VAlignmentType,
};
export default class CanvasItemText extends CanvasItem<CanvasItemTextPropsType> {
    get type(): CanvasItemType {
        return 'text';
    }
    static genStyle(props: CanvasItemTextPropsType) {
        const style: CSSProperties = {
            display: 'flex',
            width: '100%',
            height: '100%',
            fontSize: `${props.fontSize}px`,
            fontFamily: props.fontFamily,
            color: props.color,
            alignItems: props.textVerticalAlignment,
            justifyContent: props.textHorizontalAlignment,
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
            textHorizontalAlignment: this.props.textHorizontalAlignment as string,
            textVerticalAlignment: this.props.textHorizontalAlignment as string,
            ...super.toJson(),
        };
    }
    static fromJson(json: AnyObjectType) {
        return new CanvasItemText(json.id, {
            text: json.text,
            color: json.color,
            fontSize: json.fontSize,
            fontFamily: json.fontFamily,
            textHorizontalAlignment: json.textHorizontalAlignment as HAlignmentType,
            textVerticalAlignment: json.textVerticalAlignment as VAlignmentType,
            ...super.propsFromJson(json),
        });
    }
    static genDefaultItem() {
        return CanvasItemText.fromJson({
            ...genTextDefaultProps(),
            ...genTextDefaultBoxStyle(),
        });
    }
    applyTextData(textData: ToolingTextType) {
        this.applyProps(textData);
    }
    static validate(json: AnyObjectType) {
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
