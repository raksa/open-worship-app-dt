import { anyObjectType } from '../../helper/helpers';
import CanvasController from './CanvasController';
import FileSource from '../../helper/FileSource';
import CanvasItem, { CanvasItemPropsType, genTextDefaultBoxStyle } from './CanvasItem';

export type CanvasItemImagePropsType = CanvasItemPropsType & {
    filePath: string,
    imageDataUrl?: string,
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
            filePath: this.props.filePath,
            imageWidth: this.props.imageWidth,
            imageHeight: this.props.imageHeight,
            ...super.toJson(),
        };
    }
    static fromJson(canvasController: CanvasController,
        json: anyObjectType) {
        return new CanvasItemImage(json.id, canvasController, {
            filePath: json.filePath,
            imageWidth: json.imageWidth,
            imageHeight: json.imageHeight,
            ...super.propsFromJson(json),
        });
    }
    static genFromInsertion(canvasController: CanvasController,
        x: number, y: number,
        fileSource: FileSource) {
        return new Promise<CanvasItemImage>((resolve, reject) => {
            const image = document.createElement('img');
            image.src = fileSource.src;
            image.onload = () => {
                const imageWidth = image.clientWidth;
                const imageHeight = image.clientHeight;
                const newItem = CanvasItemImage.fromJson(canvasController, {
                    filePath: fileSource.filePath,
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
    async loadImageData() {
        const fileSource = FileSource.genFileSource(this.props.filePath);
        this.props.imageDataUrl = await CanvasItemImage.readImageData(fileSource);
    }
    static readImageData(fileSource: FileSource) {
        return new Promise<string>((resolve, reject) => {
            const image = document.createElement('img');
            image.src = fileSource.src;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const imageWidth = image.clientWidth;
                const imageHeight = image.clientHeight;
                const ctx = canvas.getContext('2d');
                if (ctx === null) {
                    return reject(new Error('Fail to read image'));
                }
                ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
                const imageData = ctx.getImageData(0, 0,
                    imageWidth, imageHeight);
                const dataUrl = `url(data:${fileSource.metadata?.appMimetype.mimetype};${imageData}`;
                resolve(dataUrl);
            };
            image.onerror = () => {
                reject(new Error('Image load error'));
            };
        });
    }
}
