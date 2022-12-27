import { AnyObjectType, getImageDim } from '../../helper/helpers';
import FileSource from '../../helper/FileSource';
import {
    CanvasItemMediaPropsType,
    genTextDefaultBoxStyle,
    validateMediaProps,
} from './canvasHelpers';
import CanvasItem, {
    CanvasItemError,
    CanvasItemPropsType,
} from './CanvasItem';
import appProvider from '../../server/appProvider';

export type CanvasItemImagePropsType = CanvasItemPropsType & CanvasItemMediaPropsType;
export default class CanvasItemImage extends CanvasItem<CanvasItemImagePropsType> {
    static gegStyle(_props: CanvasItemImagePropsType) {
        return {};
    }
    getStyle() {
        return CanvasItemImage.gegStyle(this.props);
    }
    static async genFromInsertion(x: number, y: number,
        fileSource: FileSource) {
        const [mediaWidth, mediaHeight] = await getImageDim(fileSource.src);
        const srcData = await fileSource.getSrcData();
        const props: CanvasItemImagePropsType = {
            srcData,
            mediaWidth,
            mediaHeight,
            ...genTextDefaultBoxStyle(),
            left: x,
            top: y,
            width: mediaWidth,
            height: mediaHeight,
            type: 'image',
        };
        return this.fromJson(props);
    }
    toJson(): CanvasItemImagePropsType {
        return {
            srcData: this.props.srcData,
            mediaWidth: this.props.mediaWidth,
            mediaHeight: this.props.mediaHeight,
            ...super.toJson(),
        };
    }
    static fromJson(json: CanvasItemImagePropsType) {
        try {
            this.validate(json);
            return new CanvasItemImage(json);
        } catch (error) {
            appProvider.appUtils.handleError(error);
            return CanvasItemError.fromJsonError(json);
        }
    }
    static validate(json: AnyObjectType) {
        super.validate(json);
        validateMediaProps(json);
    }
}
