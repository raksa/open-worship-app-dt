import { AnyObjectType, getImageDim } from '../../helper/helpers';
import FileSource from '../../helper/FileSource';
import {
    genTextDefaultBoxStyle,
} from './canvasHelpers';
import CanvasItem, {
    CanvasItemError,
    CanvasItemPropsType,
} from './CanvasItem';

export type CanvasItemImagePropsType = CanvasItemPropsType & {
    src: string,
    imageWidth: number;
    imageHeight: number;
};
export default class CanvasItemImage extends CanvasItem<CanvasItemImagePropsType> {
    get imageWidth() {
        return this.props.imageWidth;
    }
    set imageWidth(width: number) {
        this.props.imageWidth = width;
    }
    static gegStyle(_props: CanvasItemImagePropsType) {
        return {};
    }
    getStyle() {
        return CanvasItemImage.gegStyle(this.props);
    }
    static async genFromInsertion(x: number, y: number,
        fileSource: FileSource) {
        const [imageWidth, imageHeight] = await getImageDim(fileSource.src);
        const props: CanvasItemImagePropsType = {
            src: fileSource.src,
            imageWidth,
            imageHeight,
            ...genTextDefaultBoxStyle(),
            left: x,
            top: y,
            width: imageWidth,
            height: imageHeight,
            type: 'image',
        };
        return this.fromJson(props);
    }
    toJson(): CanvasItemImagePropsType {
        return {
            src: this.props.src,
            imageWidth: this.props.imageWidth,
            imageHeight: this.props.imageHeight,
            ...super.toJson(),
        };
    }
    static fromJson(json: CanvasItemImagePropsType) {
        try {
            this.validate(json);
            return new CanvasItemImage(json);
        } catch (error) {
            console.log(error);
            return CanvasItemError.fromJsonError(json);
        }
    }
    static validate(json: AnyObjectType) {
        super.validate(json);
        if (typeof json.src !== 'string' ||
            typeof json.imageWidth !== 'number' ||
            typeof json.imageHeight !== 'number'
        ) {
            console.log(json);
            throw new Error('Invalid canvas item image data');
        }
    }
}
