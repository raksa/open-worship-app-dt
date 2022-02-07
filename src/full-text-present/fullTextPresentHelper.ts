import { biblePresentToTitle, getVerses } from '../bible-helper/helpers';
import { toLocaleNumber } from '../bible-search/bibleSearchHelpers';
import { renderPresent } from '../helper/appHelper';
import { removePX } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { LyricPresentType } from '../lyric-list/LyricList';
import { BLACK_COLOR } from '../others/ColorPicker';
import { HIGHLIGHT_HOVER_SETTING } from './Utils';

export type BiblePresentType = {
    bible: string, target: {
        book: string,
        chapter: number,
        startVerse: number,
        endVerse: number,
    },
};

type StylingType = {
    color?: string;
    fontSize?: number;
    textShadow?: string;
};
class FullTextPresentHelper {
    tableShowing = document.createElement('table');
    textStyle: { [key: string]: string } = {};
    isShowing = false;
    constructor() {
        this.tableShowing.innerHTML = `
        <thead><tr></tr></thead>
        <tbody><tr></tr></tbody>
        `;
    }
    get textColor() {
        return this.textStyle.color || BLACK_COLOR;
    }
    get textFontSize() {
        const fontSize = this.textStyle.fontSize || '111px';
        return removePX(fontSize);
    }
    _clearChildren() {
        (this.tableShowing.tHead?.firstChild as HTMLTableRowElement).innerHTML = '';
        this.tableShowing.tBodies[0].innerHTML = '';
    }
    setList(data: { title: string, texts: string[] }[]) {
        this._clearChildren();
        if (data.length) {
            data.forEach(({ title }) => {
                const trHead = this.tableShowing.tHead?.firstChild as HTMLTableRowElement;
                const th = document.createElement('th');
                th.innerHTML = title;
                trHead.appendChild(th);
            });
            const textsLength = data[0].texts.length;
            for (let i = 0; i < textsLength; i++) {
                const tr = document.createElement('tr');
                data.forEach((d) => {
                    const td = document.createElement('td');
                    td.innerHTML = d.texts[i];
                    tr.appendChild(td);
                });
                const tBody = this.tableShowing.tBodies[0];
                tBody.appendChild(tr);
            }
        }
        this.applyStyle();
    }
    _forceSetStyle(style: CSSStyleDeclaration, prop: string, value?: string) {
        if (value) {
            (style as any)[prop] = value;
        }
    }
    applyStyle() {
        const { color, fontSize, textShadow } = this.textStyle;
        const thOrTd = this.tableShowing.querySelectorAll('th, td');
        Array.from(thOrTd).forEach((element) => {
            const cell = element as HTMLTableCellElement;
            this._forceSetStyle(cell.style, 'color', color);
            this._forceSetStyle(cell.style, 'fontSize', fontSize);
            this._forceSetStyle(cell.style, 'textShadow', textShadow);
        });
        this.render();
        this.saveSetting();
    }
    setStyle({ color, fontSize, textShadow }: StylingType) {
        color && (this.textStyle['color'] = color);
        fontSize && (this.textStyle['fontSize'] = `${fontSize}px`);
        textShadow && (this.textStyle['textShadow'] = textShadow);
        this.applyStyle();
    }
    loadSetting() {
        const settingStr = getSetting('bible-showing-controller');
        try {
            const { textStyle, html } = JSON.parse(settingStr);
            if (html && ~html.indexOf('table')) {
                this.tableShowing.innerHTML = html;
                this.textStyle = textStyle;
            }
        } catch (error) {

        }
    }
    saveSetting() {
        setSetting('bible-showing-controller', JSON.stringify({
            textStyle: this.textStyle,
            html: this.tableShowing.outerHTML,
        }));
    }
    show() {
        this.isShowing = true;
        this.render();
    }
    hide() {
        this.isShowing = false;
        renderPresent({
            script: `
            const bible = getBible();
            bible.innerHTML = '';
        `});
    }
    render() {
        if (this.isShowing) {
            this.resetHighlight();
            renderPresent({
                script: `
                const bible = getBible();
                bible.innerHTML = \`${this.tableShowing.outerHTML}\`;
            `});
        }
    }
    setRenderScroll(amount: number, isScrollUp: boolean) {
        if (this.isShowing) {
            renderPresent({
                script: `
                const bible = getBible();
                bible.scrollTop += ${(isScrollUp ? 1 : -1) * amount};
            `});
        }
    }
    setScrollTop() {
        if (this.isShowing) {
            renderPresent({
                script: `
                const bible = getBible();
                bible.scrollTop = 0;
            `});
        }
    }
    setScrollBottom() {
        if (this.isShowing) {
            renderPresent({
                script: `
                const bible = getBible();
                const table = bible.querySelector('table');
                const bibleBC = bible.getBoundingClientRect();
                const tableBC = table.getBoundingClientRect();
                bible.scrollTop = tableBC.height - bibleBC.height;
            `});
        }
    }
    resetHighlight() {
        const isShouldHighlight = getSetting(HIGHLIGHT_HOVER_SETTING) === 'true';
        const tds = this.tableShowing.querySelectorAll('td');
        Array.from(tds).forEach((td) => {
            Array.from(td.children).forEach((span) => {
                if (isShouldHighlight) {
                    span.classList.add('highlight');
                } else {
                    span.classList.remove('highlight');
                }
            });
        });
    }
    renderFromData(data: {
        title: string, texts: string[],
    }[] | null) {
        if (data === null) {
            fullTextPresentHelper.setList([]);
            fullTextPresentHelper.hide();
        } else {
            fullTextPresentHelper.setList(data);
            fullTextPresentHelper.show();
        }
    }
    renderBibleFromBiblePresentList = (biblePresents: BiblePresentType[]) => {
        Promise.all(biblePresents.map((biblePresent) => {
            return new Promise<{
                title: string, texts: string[]
            }>(async (resolve, _) => {
                const bibleTitle = biblePresentToTitle(biblePresent);
                const title = `<span class="bible">${biblePresent.bible}</span>|<span class="title">${bibleTitle}</span >`;
                const verses = await getVerses(biblePresent.bible, biblePresent.target.book, biblePresent.target.chapter);
                let text = '';
                if (verses !== null) {
                    for (let i = biblePresent.target.startVerse; i <= biblePresent.target.endVerse; i++) {
                        const verseNumb = toLocaleNumber(biblePresent.bible, i);
                        text += `<span data-highlight="${i}"><span class="verse-number">${verseNumb}</span>: ${verses[`${i}`]}</span>`;
                    }
                }
                resolve({ title, texts: [text] });
            });
        })).then((renderedList) => {
            this.renderFromData(renderedList);
        });
    }
    renderLyricsList = (lyricsList: LyricPresentType[]) => {
        const newList = lyricsList.map((lyric) => {
            const texts = lyric.text.split('===').map((text, i) => {
                return `<span data-highlight="${i}">${text.trim().replace(/\n/g, '<br/>')}</span>`;
            });
            return { title: lyric.title, texts };
        });
        this.renderFromData(newList);
    };
}

const fullTextPresentHelper = new FullTextPresentHelper();
export default fullTextPresentHelper;
