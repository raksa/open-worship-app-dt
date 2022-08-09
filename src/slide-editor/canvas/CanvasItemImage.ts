import { AnyObjectType } from '../../helper/helpers';
import FileSource from '../../helper/FileSource';
import {
    CanvasItemPropsType,
    genTextDefaultBoxStyle,
} from './canvasHelpers';
import CanvasItem, { CanvasItemError } from './CanvasItem';

export type CanvasItemImagePropsType = CanvasItemPropsType & {
    src: string,
    imageWidth: number;
    imageHeight: number;
};
export default class CanvasItemImage extends CanvasItem<CanvasItemImagePropsType> {
    static gegStyle(_props: CanvasItemImagePropsType) {
        return {};
    }
    getStyle() {
        return CanvasItemImage.gegStyle(this.props);
    }
    static genFromInsertion(x: number, y: number,
        fileSource: FileSource) {
        return new Promise<CanvasItemImage | CanvasItemError>((resolve, reject) => {
            const image = document.createElement('img');
            image.src = fileSource.src;
            image.onload = () => {
                const imageWidth = image.naturalWidth;
                const imageHeight = image.naturalHeight;
                const props: CanvasItemImagePropsType = {
                    src: fileSource.src,
                    imageWidth,
                    imageHeight,
                    ...genTextDefaultBoxStyle(),
                    left: x,
                    top: y,
                    type: 'image',
                };
                const newItem = CanvasItemImage.fromJson(props);
                resolve(newItem);
            };
            image.onerror = () => {
                reject(new Error('Image load error'));
            };
        });
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
