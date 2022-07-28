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
    static fromJson(json: anyObjectType) {
        return new CanvasItemBible(json.id, {
            bibleNames: json.bibleNames,
            bibleItemTarget: json.bibleItemTarget,
            text: '',
            color: json.color,
            fontSize: json.fontSize,
            fontFamily: json.fontFamily,
            ...super.propsFromJson(json),
        });
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
