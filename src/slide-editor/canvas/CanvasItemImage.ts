import { anyObjectType } from '../../helper/helpers';
import FileSource from '../../helper/FileSource';
import CanvasItem, { CanvasItemPropsType, genTextDefaultBoxStyle } from './CanvasItem';
import fileHelpers from '../../helper/fileHelper';

export type CanvasItemImagePropsType = CanvasItemPropsType & {
    filePath: string,
    src: string | null;
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
    static fromJson(json: anyObjectType) {
        return new CanvasItemImage(json.id, {
            filePath: json.filePath,
            src: null,
            imageWidth: json.imageWidth,
            imageHeight: json.imageHeight,
            ...super.propsFromJson(json),
        });
    }
    static genFromInsertion(x: number, y: number,
        fileSource: FileSource) {
        return new Promise<CanvasItemImage>((resolve, reject) => {
            const image = document.createElement('img');
            image.src = fileSource.src;
            image.onload = () => {
                const imageWidth = image.clientWidth;
                const imageHeight = image.clientHeight;
                const newItem = CanvasItemImage.fromJson({
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
    async initProps() {
        this.props.src = await CanvasItemImage.loadSrc(this.props.filePath);
    }
    static async loadSrc(filePath: string) {
        const fileSource = FileSource.genFileSource(filePath);
        try {
            if (await fileHelpers.checkFileExist(fileSource.filePath)) {
                return fileSource.src;
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }
    static validate(json: anyObjectType) {
        super.validate(json);
        if (typeof json.filePath !== 'string' ||
            typeof json.color !== 'string' ||
            typeof json.imageWidth !== 'number' ||
            typeof json.imageHeight !== 'number'
        ) {
            console.log(json);
            throw new Error('Invalid canvas item image data');
        }
    }
}
