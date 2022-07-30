import { AnyObjectType } from '../../helper/helpers';
import FileSource from '../../helper/FileSource';
import CanvasItem, { CanvasItemPropsType, genTextDefaultBoxStyle } from './CanvasItem';

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
    toJson() {
        return {
            src: this.props.src,
            imageWidth: this.props.imageWidth,
            imageHeight: this.props.imageHeight,
            ...super.toJson(),
        };
    }
    static fromJson(json: AnyObjectType) {
        return new CanvasItemImage(json.id, {
            src: json.src,
            imageWidth: json.imageWidth,
            imageHeight: json.imageHeight,
            ...super.propsFromJson(json),
            type: 'image',
        });
    }
    static genFromInsertion(x: number, y: number,
        fileSource: FileSource) {
        return new Promise<CanvasItemImage>((resolve, reject) => {
            const image = document.createElement('img');
            image.src = fileSource.src;
            image.onload = () => {
                const imageWidth = image.naturalWidth;
                const imageHeight = image.naturalHeight;
                const newItem = CanvasItemImage.fromJson({
                    src: fileSource.src,
                    imageWidth,
                    imageHeight,
                    ...genTextDefaultBoxStyle(),
                    left: x,
                    top: y,
                });
                resolve(newItem);
            };
            image.onerror = () => {
                reject(new Error('Image load error'));
            };
        });
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
