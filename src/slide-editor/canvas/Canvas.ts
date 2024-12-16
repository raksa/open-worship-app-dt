import { AnyObjectType, toMaxId } from '../../helper/helpers';
import SlideItem from '../../slide-list/SlideItem';
import ScreenManager from '../../_screen/ScreenManager';
import CanvasItem, { CanvasItemError } from './CanvasItem';
import CanvasItemBibleItem from './CanvasItemBibleItem';
import CanvasItemImage from './CanvasItemImage';
import CanvasItemText from './CanvasItemText';
import CanvasItemVideo from './CanvasItemVideo';

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
            const ids = this.canvasItems.map((item) => item.id);
            return toMaxId(ids);
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
        const display = ScreenManager.getDefaultScreenDisplay();
        const { width, height } = display.bounds;
        return { width, height };
    }
    static canvasItemFromJson(json: any) {
        switch (json.type) {
            case 'image':
                return CanvasItemImage.fromJson(json);
            case 'video':
                return CanvasItemVideo.fromJson(json);
            case 'text':
                return CanvasItemText.fromJson(json);
            case 'bible':
                return CanvasItemBibleItem.fromJson(json);
            default:
                return CanvasItemError.fromJsonError(json);
        }
    }
    static fromJson({ metadata, canvasItems: canvasItemsJson }: {
        metadata: AnyObjectType,
        canvasItems: AnyObjectType[],
    }) {
        const canvasItems = canvasItemsJson.map((json: any) => {
            return this.canvasItemFromJson(json);
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
