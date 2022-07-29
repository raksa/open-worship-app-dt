import BibleItem, { BibleTargetType } from '../../bible-list/BibleItem';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from './CanvasItemText';
import { anyObjectType } from '../../helper/helpers';

export type CanvasItemBiblePropsType = CanvasItemTextPropsType & {
    bibleNames: string[];
    bibleItemTarget: BibleTargetType,
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
            bibleItem: this.props.bibleItemTarget,
            ...super.toJson(),
        };
    }
    static fromJson({ bibleNames, bibleItemTarget, ...json }: {
        bibleNames: string[];
        bibleItemTarget: BibleTargetType;
    } & anyObjectType) {
        const newTextItem = super.fromJson(json);
        const props = {
            bibleNames,
            bibleItemTarget,
            ...newTextItem.props,
        };
        return new CanvasItemBible(json.id, props);
    }
    static fromBibleItem(bibleItem: BibleItem) {
        const newTextItem = super.genDefaultItem();
        const json = {
            bibleNames: [bibleItem.bibleName],
            bibleItemTarget: bibleItem.toJson(),
            ...newTextItem.toJson(),
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
