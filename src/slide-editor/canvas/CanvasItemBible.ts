import BibleItem, {
    BibleTargetType,
} from '../../bible-list/BibleItem';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from './CanvasItemText';
import { AnyObjectType } from '../../helper/helpers';
import { CanvasItemError } from './CanvasItem';
import {
    HAlignmentType,
    VAlignmentType,
} from './canvasHelpers';
import appProvider from '../../server/appProvider';

export type CanvasItemBiblePropsType = CanvasItemTextPropsType & {
    bibleNames: string[];
    bibleItemTarget: BibleTargetType,
    bibleRenderedList: {
        title: string,
        text: string,
    }[],
};
export default class CanvasItemBible extends CanvasItemText {
    props: CanvasItemBiblePropsType;
    constructor(props: CanvasItemBiblePropsType) {
        super(props);
        this.props = props;
    }
    toJson(): CanvasItemBiblePropsType {
        return this.props;
    }
    static fromJson(json: CanvasItemBiblePropsType) {
        try {
            this.validate(json);
            return new CanvasItemBible(json);
        } catch (error) {
            appProvider.appUtils.handleError(error);
            return CanvasItemError.fromJsonError(json);
        }
    }
    static async fromBibleItem(id: number, bibleItem: BibleItem) {
        const title = await BibleItem.itemToTitle(bibleItem);
        const text = await BibleItem.itemToText(bibleItem);
        const newTextItem = super.genDefaultItem();
        const props = newTextItem.toJson();
        props.id = id;
        const json: CanvasItemBiblePropsType = {
            ...props,
            bibleNames: [bibleItem.bibleName],
            bibleItemTarget: bibleItem.toJson().target,
            bibleRenderedList: [{
                title, text,
            }],
            horizontalAlignment: 'left' as HAlignmentType,
            verticalAlignment: 'top' as VAlignmentType,
            textHorizontalAlignment: 'left' as HAlignmentType,
            textVerticalAlignment: 'top' as VAlignmentType,
            type: 'bible',
        };
        return CanvasItemBible.fromJson(json);
    }
    static validate(json: AnyObjectType) {
        super.validate(json);
        BibleItem.validate({
            id: -1,
            target: json.bibleItemTarget,
            bibleName: json.bibleNames[0],
        });
    }
}
