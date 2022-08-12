import { AnyObjectType, getVideoDim } from '../../helper/helpers';
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

export type CanvasItemVideoPropsType = CanvasItemPropsType & CanvasItemMediaPropsType;
export default class CanvasItemVideo extends CanvasItem<CanvasItemVideoPropsType> {
    static gegStyle(_props: CanvasItemVideoPropsType) {
        return {};
    }
    getStyle() {
        return CanvasItemVideo.gegStyle(this.props);
    }
    static async genFromInsertion(x: number, y: number,
        fileSource: FileSource) {
        const [mediaWidth, mediaHeight] = await getVideoDim(fileSource.src);
        const props: CanvasItemVideoPropsType = {
            src: fileSource.src,
            mediaWidth: mediaWidth,
            mediaHeight: mediaHeight,
            ...genTextDefaultBoxStyle(),
            left: x,
            top: y,
            width: mediaWidth,
            height: mediaHeight,
            type: 'video',
        };
        return this.fromJson(props);
    }
    toJson(): CanvasItemVideoPropsType {
        return {
            src: this.props.src,
            mediaWidth: this.props.mediaWidth,
            mediaHeight: this.props.mediaHeight,
            ...super.toJson(),
        };
    }
    static fromJson(json: CanvasItemVideoPropsType) {
        try {
            this.validate(json);
            return new CanvasItemVideo(json);
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
