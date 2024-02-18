import EventHandler from '../../event/EventHandler';
import Canvas from './Canvas';
import CanvasItem, {
    CanvasItemPropsType,
} from './CanvasItem';
import {
    getSetting, setSetting,
} from '../../helper/settingHelper';
import FileSource from '../../helper/FileSource';
import CanvasItemText from './CanvasItemText';
import CanvasItemImage from './CanvasItemImage';
import CanvasItemBibleItem from './CanvasItemBibleItem';
import BibleItem from '../../bible-list/BibleItem';
import SlideItem from '../../slide-list/SlideItem';
import {
    CanvasItemMediaPropsType, CCEventType,
} from './canvasHelpers';
import CanvasItemVideo from './CanvasItemVideo';
import { showSimpleToast } from '../../toast/toastHelpers';
import { handleError } from '../../helper/errorHelpers';

const EDITOR_SCALE_SETTING_NAME = 'editor-scale';

export default class CanvasController extends EventHandler<CCEventType> {
    static readonly eventNamePrefix: string = 'canvas-c';
    private static _instance: CanvasController | null = null;
    copiedItem: CanvasItem<any> | null = null;
    _canvas: Canvas;
    _slideItem: SlideItem | null = null;
    MAX_SCALE = 3;
    MIN_SCALE = 0.2;
    SCALE_STEP = 0.1;
    _scale: number = 1;
    constructor() {
        super();
        this._canvas = Canvas.genDefaultCanvas();
        const defaultData = +(getSetting(EDITOR_SCALE_SETTING_NAME) || NaN);
        if (!isNaN(defaultData)) {
            this._scale = defaultData;
        }
    }
    init(slideItem: SlideItem | null) {
        this._slideItem = slideItem;
        this._canvas = slideItem?.canvas || Canvas.genDefaultCanvas();
    }
    get canvas() {
        return this._canvas;
    }
    get scale() {
        return this._scale;
    }
    set scale(n: number) {
        this._scale = n;
        setSetting(EDITOR_SCALE_SETTING_NAME, n.toString());
        this.addPropEvent('scale');
    }
    get isCopied() {
        if (this.copiedItem === null) {
            return false;
        }
        return this.canvas.canvasItems.includes(this.copiedItem);
    }
    fireSelectEvent(canvasItem: CanvasItem<any>) {
        this.addPropEvent('select', canvasItem);
    }
    fireControlEvent(canvasItem: CanvasItem<any>) {
        this.addPropEvent('control', canvasItem);
    }
    fireTextEditEvent(canvasItem: CanvasItem<any>) {
        this.addPropEvent('text-edit', canvasItem);
    }
    async fireUpdateEvent() {
        if (this._slideItem !== null) {
            this._slideItem.canvas = this.canvas;
        }
        this.addPropEvent('update');
    }
    async cloneItem(canvasItem: CanvasItem<any>) {
        const newCanvasItem = canvasItem.clone();
        newCanvasItem.props.top += 20;
        newCanvasItem.props.left += 20;
        newCanvasItem.props.id = this.canvas.maxItemId + 1;
        return newCanvasItem;
    }
    async duplicate(canvasItem: CanvasItem<any>) {
        const newCanvasItems = this.canvas.newCanvasItems;
        const newCanvasItem = await this.cloneItem(canvasItem);
        if (newCanvasItem === null) {
            return;
        }
        const index = this.canvas.canvasItems.indexOf(canvasItem);
        newCanvasItems.splice(index + 1, 0, newCanvasItem);
        this.setCanvasItems(newCanvasItems);
    }
    deleteItem(canvasItem: CanvasItem<any>) {
        if (this.copiedItem === canvasItem) {
            this.copiedItem = null;
        }
        const newCanvasItems = this.canvas.canvasItems.filter((item) => {
            return item !== canvasItem;
        });
        this.setCanvasItems(newCanvasItems);
    }
    async paste() {
        const newCanvasItems = this.canvas.newCanvasItems;
        if (this.copiedItem !== null) {
            const newCanvasItem = await this.cloneItem(this.copiedItem);
            if (newCanvasItem === null) {
                return;
            }
            newCanvasItems.push(newCanvasItem);
            this.setCanvasItems(newCanvasItems);
        }
    }
    addNewItem(canvasItem: CanvasItem<any>) {
        const newCanvasItems = this.canvas.newCanvasItems;
        canvasItem.props.id = this.canvas.maxItemId + 1;
        newCanvasItems.push(canvasItem);
        this.setCanvasItems(newCanvasItems);
    }
    async addNewTextItem() {
        const newItem = CanvasItemText.genDefaultItem();
        this.addNewItem(newItem);
    }
    async addNewMediaItem(filePath: string, event: any) {
        try {
            const fileSource = FileSource.getInstance(filePath);
            const mediaType = (
                fileSource.metadata?.appMimetype.mimetypeName || ''
            );
            if (!['image', 'video'].includes(mediaType)) {
                showSimpleToast('Insert Medias',
                    'Only image and video files are supported');
                return;
            }
            const rect = (event.target as HTMLDivElement).
                getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / this.scale);
            const y = Math.floor((event.clientY - rect.top) / this.scale);
            const newItem = await (mediaType === 'image' ?
                CanvasItemImage.genFromInsertion(x, y, filePath) :
                CanvasItemVideo.genFromInsertion(x, y, filePath));
            this.addNewItem(newItem);
            return;
        } catch (error) {
            handleError(error);
        }
        showSimpleToast('Insert Image or Video', 'Fail to insert medias');
    }
    async addNewBibleItem(bibleItem: BibleItem) {
        const id = this.canvas.maxItemId + 1;
        const newItem = await CanvasItemBibleItem.fromBibleItem(id, bibleItem);
        this.addNewItem(newItem);
    }
    applyOrderingData(canvasItem: CanvasItem<any>, isBack: boolean) {
        const newCanvasItems = this.canvas.canvasItems.map((item) => {
            if (item === canvasItem) {
                item.props.zIndex = isBack ? 1 : 2;
            } else {
                item.props.zIndex = isBack ? 2 : 1;
            }
            return item;
        });
        this.setCanvasItems(newCanvasItems);
    }
    applyItemFully(canvasItem: CanvasItem<any>) {
        const isMedia = ['image', 'video'].includes(canvasItem.type);
        const props = canvasItem.props as CanvasItemPropsType;
        const parentWidth = this.canvas.width;
        const parentHeight = this.canvas.height;
        let width = props.width;
        let height = props.height;
        if (isMedia) {
            const mediaProps = canvasItem.props as CanvasItemMediaPropsType;
            width = mediaProps.mediaWidth;
            height = mediaProps.mediaHeight;
        }
        const scale = Math.min(parentWidth / width,
            parentHeight / height);
        props.width = width * scale;
        props.height = height * scale;
        const parentDimension = {
            parentWidth: this.canvas.width,
            parentHeight: this.canvas.height,
        };
        canvasItem.applyBoxData(parentDimension, {
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
        });
    }
    stopAllMods(isSilent?: boolean) {
        this.canvas.canvasItems.forEach((item) => {
            if (isSilent) {
                item.isSelected = false;
                item.isControlling = false;
                item.isEditing = false;
            } else {
                this.setItemIsSelecting(item, false);
                this.setItemIsControlling(item, false);
                this.setItemIsEditing(item, false);
            }
        });
    }
    applyScale(isUp: boolean) {
        let newScale = this.scale + (isUp ? -1 : 1) * this.SCALE_STEP;
        if (newScale < this.MIN_SCALE) {
            newScale = this.MIN_SCALE;
        }
        if (newScale > this.MAX_SCALE) {
            newScale = this.MAX_SCALE;
        }
        this.scale = newScale;
    }
    setCanvasItems(canvasItems: CanvasItem<any>[]) {
        this.canvas.canvasItems = canvasItems;
        this.fireUpdateEvent();
    }
    setItemIsSelecting(canvasItem: CanvasItem<any>, b: boolean) {
        canvasItem.isSelected = b;
        this.fireSelectEvent(canvasItem);
        this.setItemIsControlling(canvasItem, b);
    }
    setItemIsControlling(canvasItem: CanvasItem<any>, b: boolean) {
        canvasItem.isControlling = b;
        this.fireControlEvent(canvasItem);
    }
    setItemIsEditing(canvasItem: CanvasItem<any>, b: boolean) {
        canvasItem.isEditing = b;
        this.fireTextEditEvent(canvasItem);
    }
    static getInstance() {
        if (this._instance === null) {
            this._instance = new this();
        }
        return this._instance;
    }
}
