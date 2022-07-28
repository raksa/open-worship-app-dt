import CanvasController from './CanvasController';
import { BibleTargetType } from '../../bible-list/BibleItem';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from './CanvasItemText';
import { anyObjectType } from '../../helper/helpers';

export type CanvasItemBiblePropsType = CanvasItemTextPropsType & {
    bibleNames: string[];
    bibleItem: BibleTargetType,
};
export default class CanvasItemBible extends CanvasItemText {
    props: CanvasItemBiblePropsType;
    constructor(id: number, canvasController: CanvasController,
        props: CanvasItemBiblePropsType) {
        super(id, canvasController, props);
        this.props = props;
    }
    toJson() {
        return {
            bibleNames: this.props.bibleNames,
            bibleItem: this.props.bibleItem,
            ...super.toJson(),
        };
    }
    static fromJson(canvasController: CanvasController,
        json: anyObjectType) {
        return new CanvasItemBible(json.id, canvasController, {
            bibleNames: json.bibleNames,
            bibleItem: json.bibleItem,
            text: '',
            color: json.color,
            fontSize: json.fontSize,
            fontFamily: json.fontFamily,
            ...super.propsFromJson(json),
        });
    }
}
