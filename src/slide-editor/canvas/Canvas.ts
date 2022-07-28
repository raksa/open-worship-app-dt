import { anyObjectType } from '../../helper/helpers';
import SlideItem from '../../slide-list/SlideItem';
import CanvasItem from './CanvasItem';
import CanvasItemImage from './CanvasItemImage';
import CanvasItemText from './CanvasItemText';

export type HAlignmentType = 'left' | 'center' | 'right';
export type VAlignmentType = 'top' | 'center' | 'bottom';

type CanvasPropsType = {
    width: number, height: number,
    canvasItems: CanvasItem<any>[],
};
export default class Canvas {
    static _objectId = 0;
    _objectId: number;
    props: CanvasPropsType;
    constructor(props: CanvasPropsType) {
        this._objectId = CanvasItem._objectId++;
        this.props = props;
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
    }
    static fromJson(json: anyObjectType) {
        const canvasItems: CanvasItem<any>[] = json.canvasItems.map((item: anyObjectType) => {
            let canvasItem: CanvasItem<any>;
            if (item.type === 'image') {
                canvasItem = CanvasItemImage.fromJson(item);
            } else {
                canvasItem = CanvasItemText.fromJson(item);
            }
            // TODO: handle other type of element
            canvasItems.push(canvasItem);
        });
        return new Canvas({
            width: json.width,
            height: json.height,
            canvasItems,
        });
    }
    static fromSlideItem(slideItem: SlideItem) {
        return Canvas.fromJson(slideItem.toJson());
    }
}
