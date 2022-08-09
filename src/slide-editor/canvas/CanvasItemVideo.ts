import { AnyObjectType, getVideoDim } from '../../helper/helpers';
import FileSource from '../../helper/FileSource';
import {
    genTextDefaultBoxStyle,
} from './canvasHelpers';
import CanvasItem, {
    CanvasItemError,
    CanvasItemPropsType,
} from './CanvasItem';

export type CanvasItemVideoPropsType = CanvasItemPropsType & {
    src: string,
    videoWidth: number;
    videoHeight: number;
};
export default class CanvasItemVideo extends CanvasItem<CanvasItemVideoPropsType> {
    get videoWidth() {
        return this.props.videoWidth;
    }
    set videoWidth(width: number) {
        this.props.videoWidth = width;
    }
    static gegStyle(_props: CanvasItemVideoPropsType) {
        return {};
    }
    getStyle() {
        return CanvasItemVideo.gegStyle(this.props);
    }
    static async genFromInsertion(x: number, y: number,
        fileSource: FileSource) {
        const [videoWidth, videoHeight] = await getVideoDim(fileSource.src);
        const props: CanvasItemVideoPropsType = {
            src: fileSource.src,
            videoWidth: videoWidth,
            videoHeight: videoHeight,
            ...genTextDefaultBoxStyle(),
            left: x,
            top: y,
            width: videoWidth,
            height: videoHeight,
            type: 'video',
        };
        return this.fromJson(props);
    }
    toJson(): CanvasItemVideoPropsType {
        return {
            src: this.props.src,
            videoWidth: this.props.videoWidth,
            videoHeight: this.props.videoHeight,
            ...super.toJson(),
        };
    }
    static fromJson(json: CanvasItemVideoPropsType) {
        try {
            this.validate(json);
            return new CanvasItemVideo(json);
        } catch (error) {
            console.log(error);
            return CanvasItemError.fromJsonError(json);
        }
    }
    static validate(json: AnyObjectType) {
        super.validate(json);
        if (typeof json.src !== 'string' ||
            typeof json.videoWidth !== 'number' ||
            typeof json.videoHeight !== 'number'
        ) {
            console.log(json);
            throw new Error('Invalid canvas item video data');
        }
    }
}
