import BibleItem, { BibleTargetType } from '../../bible-list/BibleItem';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from './CanvasItemText';
import { anyObjectType } from '../../helper/helpers';

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
    constructor(id: number, props: CanvasItemBiblePropsType) {
        super(id, props);
        this.props = props;
    }
    toJson() {
        return {
            bibleNames: this.props.bibleNames,
            bibleItemTarget: this.props.bibleItemTarget,
            bibleRenderedList: this.props.bibleRenderedList,
            ...super.toJson(),
        };
    }
    static fromJson({
        bibleNames, bibleItemTarget, bibleRenderedList,
        ...json
    }: {
        bibleNames: string[];
        bibleItemTarget: BibleTargetType;
        bibleRenderedList: {
            title: string, text: string,
        }[]
    } & anyObjectType) {
        const newTextItem = super.fromJson(json);
        const props = {
            bibleNames,
            bibleItemTarget,
            bibleRenderedList,
            ...newTextItem.props,
        };
        return new CanvasItemBible(json.id, props);
    }
    static async fromBibleItem(bibleItem: BibleItem) {
        const title = await BibleItem.itemToTitle(bibleItem);
        const text = await BibleItem.itemToText(bibleItem);
        const newTextItem = super.genDefaultItem();
        const json = {
            bibleNames: [bibleItem.bibleName],
            bibleItemTarget: bibleItem.toJson().target,
            bibleRenderedList: [{
                title, text,
            }],
            ...newTextItem.toJson(),
            texHorizontalAlign: 'left',
            texVerticalAlign: 'top',
            type: 'bible',
        };
        return CanvasItemBible.fromJson(json);
    }
    static validate(json: anyObjectType) {
        super.validate(json);
        BibleItem.validate({
            id: -1,
            target: json.bibleItemTarget,
            bibleName: json.bibleNames[0],
        });
    }
}
