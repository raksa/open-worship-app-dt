import FileSource from '../../helper/FileSource';
import { anyObjectType } from '../../helper/helpers';
import SlideItem from '../../slide-list/SlideItem';
import CanvasController from './CanvasController';
import CanvasItem from './CanvasItem';
import CanvasItemImage from './CanvasItemImage';
import CanvasItemText from './CanvasItemText';

export enum HAlignmentEnum {
    Left = 'left',
    Center = 'center',
    Right = 'right',
}
export enum VAlignmentEnum {
    Top = 'start',
    Center = 'center',
    Bottom = 'end',
}

type CanvasPropsType = {
    width: number, height: number,
    canvasItems: CanvasItem<any>[],
};
export default class Canvas {
    static _objectId = 0;
    _objectId: number;
    props: CanvasPropsType;
    slideItemId: number;
    fileSource: FileSource;
    constructor(slideItemId: number, fileSource: FileSource,
        props: CanvasPropsType) {
        this._objectId = CanvasItem._objectId++;
        this.props = props;
        this.slideItemId = slideItemId;
        this.fileSource = fileSource;
    }
    get maxItemId() {
        if (this.canvasItems.length) {
            return Math.max.apply(Math, this.canvasItems.map((item) => item.id));
        }
        return 0;
    }
    get selectedCanvasItems() {
        return this.canvasItems.filter((item) => item.isSelected);
    }
    get newCanvasItems() {
        return [...this.canvasItems];
    }
    get width() {
        return this.props.width;
    }
    get height() {
        return this.props.height;
    }
    get canvasItems() {
        return this.props.canvasItems;
    }
    set canvasItems(canvasItems: CanvasItem<any>[]) {
        this.props.canvasItems = canvasItems;
        this.canvasController?.fireUpdateEvent();
    }
    get canvasController() {
        const key = SlideItem.genKeyByFileSource(this.fileSource, this.slideItemId);
        const slideItem = SlideItem.getByKey(key);
        if (slideItem === null) {
            return null;
        }
        return CanvasController.getInstant(slideItem);
    }
    static fromJson(canvasController: CanvasController,
        json: anyObjectType) {
        const slideItem = canvasController.slideItem;
        const canvasItems: CanvasItem<any>[] = json.canvasItems.map((item: anyObjectType) => {
            let canvasItem: CanvasItem<any>;
            if (item.type === 'image') {
                canvasItem = CanvasItemImage.fromJson(canvasController, item);
            } else {
                canvasItem = CanvasItemText.fromJson(canvasController, item);
            }
            // TODO: handle other type of element
            canvasItems.push(canvasItem);
        });
        return new Canvas(slideItem.id, slideItem.fileSource, {
            width: json.width,
            height: json.height,
            canvasItems,
        });
    }
    static fromSlideItem(canvasController: CanvasController,
        slideItem: SlideItem) {
        return Canvas.fromJson(canvasController, slideItem.toJson());
    }
}
