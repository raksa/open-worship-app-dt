import { CSSProperties } from 'react';
import {
    hAlignmentList,
    HAlignmentType,
    vAlignmentList,
    VAlignmentType,
} from './Canvas';
import { AnyObjectType } from '../../helper/helpers';
import { AppColorType } from '../../others/ColorPicker';
import appProvider from '../../server/appProvider';
import {
    CanvasItemPropsType,
    CanvasItemKindType,
    genTextDefaultBoxStyle,
} from './canvasHelpers';
import CanvasItem, { CanvasItemError } from './CanvasItem';

export function genTextDefaultProps(): TextPropsType {
    return {
        text: appProvider.appInfo.name,
        color: '#ffffff',
        fontSize: 60,
        fontFamily: '',
        textHorizontalAlignment: 'center',
        textVerticalAlignment: 'center',
    };
}
export type TextPropsType = {
    text: string,
    color: AppColorType,
    fontSize: number,
    fontFamily: string,
    textHorizontalAlignment: HAlignmentType,
    textVerticalAlignment: VAlignmentType,
};
export type CanvasItemTextPropsType = CanvasItemPropsType & TextPropsType;
export type ToolingTextType = {
    color?: AppColorType,
    fontSize?: number,
    fontFamily?: string,
    textHorizontalAlignment?: HAlignmentType,
    textVerticalAlignment?: VAlignmentType,
};
export default class CanvasItemText extends CanvasItem<CanvasItemTextPropsType> {
    get type(): CanvasItemKindType {
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
    static genDefaultItem() {
        return CanvasItemText.fromJson({
            ...genTextDefaultProps(),
            ...genTextDefaultBoxStyle(),
            type: 'text',
        }) as CanvasItemText;
    }
    applyTextData(textData: ToolingTextType) {
        this.applyProps(textData);
    }
    toJson(): CanvasItemTextPropsType {
        return this.props;
    }
    static fromJson(json: CanvasItemTextPropsType) {
        try {
            this.validate(json);
            return new CanvasItemText(json);
        } catch (error) {
            console.log(error);
            return CanvasItemError.fromJsonError(json);
        }
    }
    static validate(json: AnyObjectType) {
        super.validate(json);
        if (typeof json.text !== 'string' ||
            typeof json.color !== 'string' ||
            typeof json.fontSize !== 'number' ||
            typeof json.fontFamily !== 'string' ||
            !hAlignmentList.includes(json.horizontalAlignment) ||
            !vAlignmentList.includes(json.verticalAlignment)
        ) {
            console.log(json);
            throw new Error('Invalid canvas item text data');
        }
    }
}
