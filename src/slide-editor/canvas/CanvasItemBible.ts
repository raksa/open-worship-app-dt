import { CSSProperties } from 'react';
import { BLACK_COLOR } from '../../others/ColorPicker';
import CanvasController from './CanvasController';
import FileSource from '../../helper/FileSource';
import CanvasItem, { CanvasItemPropsType } from './CanvasItem';
import { CanvasItemType, ToolingTextType } from './canvasHelpers';
import { removePX } from '../../helper/helpers';
import BibleItem from '../../bible-list/BibleItem';

type CanvasItemBiblePropsType = CanvasItemPropsType & {
    bibleItems: BibleItem[] | null,
    color: string,
    fontSize: number,
    fontFamily: string,
};
export default class CanvasItemBible extends CanvasItem {
    props: CanvasItemBiblePropsType;
    constructor(id: number, slideItemId: number, fileSource: FileSource,
        props: CanvasItemBiblePropsType) {
        super(id, slideItemId, fileSource, props);
        this.props = props;
    }
    get type(): CanvasItemType {
        return 'text';
    }
    getStyle() {
        const style: CSSProperties = {
            display: 'flex',
            fontSize: `${this.props.fontSize}px`,
            fontFamily: this.props.fontFamily,
            color: this.props.color,
            alignItems: this.props.verticalAlignment,
            justifyContent: this.props.horizontalAlignment,
            backgroundColor: this.props.backgroundColor,
        };
        return style;
    }
    get html(): HTMLDivElement {
        const div = document.createElement('div');
        div.id = `${this.id}`;
        div.innerHTML = 'Not implement yet';
        const targetStyle = div.style as any;
        const style = {
            ...this.getStyle(),
            ...this.getBoxStyle(),
        } as any;
        Object.keys(style).forEach((k) => {
            targetStyle[k] = style[k];
        });
        return div;
    }
    static async fromHtml(canvasController: CanvasController, htmlString: string) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstChild as HTMLDivElement;
        const style = element.style;
        // TODO: extract bible item from html
        const bibleItems: BibleItem[] | null = null;
        const bibleProps = {
            bibleItems,
            fontSize: removePX(style.fontSize) || 30,
            fontFamily: style.fontFamily.replace(/"/g, '') || '',
            color: style.color || BLACK_COLOR,
        };
        let id = +element.id;
        if (!element.id || isNaN(id)) {
            id = -1;
            bibleProps.bibleItems = null;
        }
        const boxProps = super.htmlToBoxProps(htmlString);
        const slideItem = canvasController.slideItem;
        return new CanvasItemBible(id, slideItem.id, slideItem.fileSource, {
            ...bibleProps,
            ...boxProps,
        });
    }
    applyTextData(text: ToolingTextType) {
        this.applyProps(text);
    }
    async clone() {
        const canvasController = this.canvasController;
        if (canvasController === null) {
            return null;
        }
        return CanvasItemBible.fromHtml(canvasController, this.htmlString);
    }
    static htmlToType(htmlString: string) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstChild as HTMLDivElement;
        return element.innerText ? 'text' : null;
    }
}
