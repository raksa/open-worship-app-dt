import { CSSProperties } from 'react';
import CanvasItem, {
    CanvasItemKindType,
    CanvasItemPropsType, genTextDefaultBoxStyle,
} from './CanvasItem';
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
        });
    }
    applyTextData(textData: ToolingTextType) {
        this.applyProps(textData);
    }
    toJson(): CanvasItemTextPropsType {
        return this.props;
    }
    static fromJson(json: CanvasItemTextPropsType) {
        this.validate(json);
        return new CanvasItemText(json);
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
