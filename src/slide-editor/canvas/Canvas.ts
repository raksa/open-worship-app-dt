import { AnyObjectType } from '../../helper/helpers';
import SlideItem from '../../slide-list/SlideItem';
import PresentManager from '../../_present/PresentManager';
import CanvasItem from './CanvasItem';
import CanvasItemBible from './CanvasItemBible';
import CanvasItemImage from './CanvasItemImage';
import CanvasItemText from './CanvasItemText';

export type HAlignmentType = 'left' | 'center' | 'right';
export type VAlignmentType = 'top' | 'center' | 'bottom';

type CanvasPropsType = {
    width: number,
    height: number,
    canvasItems: CanvasItem<any>[],
};
export default class Canvas {
    props: CanvasPropsType;
    constructor(props: CanvasPropsType) {
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
    static genDefaultCanvas() {
        const { width, height } = Canvas.getDefaultDim();
        return new Canvas({
            width, height,
            canvasItems: [],
        });
    }
    static getDefaultDim() {
        const display = PresentManager.getDefaultPresentDisplay();
        const { width, height } = display.bounds;
        return { width, height };
    }
    static fromJson({ metadata, canvasItems: canvasItemsJson }: {
        metadata: AnyObjectType,
        canvasItems: AnyObjectType[],
    }) {
        const canvasItems = canvasItemsJson.map((json: any) => {
            if (json.type === 'image') {
                return CanvasItemImage.fromJson(json);
            } else if (json.type === 'text') {
                return CanvasItemText.fromJson(json);
            } else if (json.type === 'bible') {
                return CanvasItemBible.fromJson(json as any);
            }
            // TODO: handle other type of element
            return null;
        }).filter((item) => item !== null) as CanvasItem<any>[];
        return new Canvas({
            width: metadata.width,
            height: metadata.height,
            canvasItems,
        });
    }
    static fromSlideItem(slideItem: SlideItem) {
        return Canvas.fromJson(slideItem.toJson());
    }
}
