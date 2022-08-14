import { getVerses } from '../server/bible-helpers/helpers1';
import { toLocaleNumBB } from '../server/bible-helpers/helpers2';
import { removePX } from '../helper/helpers';
import Lyric from '../lyric-list/Lyric';
import { getSetting, setSetting } from '../helper/settingHelper';
import { AppColorType, BLACK_COLOR } from '../others/ColorPicker';
import { HIGHLIGHT_HOVER_SETTING } from '../full-text-present/Utils';
import BibleItem from '../bible-list/BibleItem';
import { renderPresent } from '../helper/presentingHelpers';
import { presentEventListener } from '../event/PresentEventListener';

type StylingType = {
    color?: AppColorType;
    fontSize?: number;
    textShadow?: string;
};
export type RenderedType = {
    title: string;
    texts: string[];
};
const tableShowing = document.createElement('table');
tableShowing.innerHTML = `
<thead><tr></tr></thead>
<tbody><tr></tr></tbody>
`;
const textStyle: { [key: string]: string } = {};
const fullTextPresentHelper = {
    tableShowing,
    textStyle,
    getTextColor() {
        return this.textStyle.color || BLACK_COLOR;
    },
    getTextFontSize() {
        const fontSize = this.textStyle.fontSize || '111px';
        return removePX(fontSize);
    },
    _clearChildren() {
        (this.tableShowing.tHead?.firstChild as HTMLTableRowElement).innerHTML = '';
        this.tableShowing.tBodies[0].innerHTML = '';
    },
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
    },
    _forceSetStyle(style: CSSStyleDeclaration, prop: string, value?: string) {
        if (value) {
            (style as any)[prop] = value;
        }
    },
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
    },
    setStyle({ color, fontSize, textShadow }: StylingType) {
        color && (this.textStyle['color'] = color);
        fontSize && (this.textStyle['fontSize'] = `${fontSize}px`);
        textShadow && (this.textStyle['textShadow'] = textShadow);
        this.applyStyle();
    },
    loadSetting() {
        const settingStr = getSetting('bible-showing-controller');
        try {
            const { textStyle, html } = JSON.parse(settingStr);
            if (html && html.include('table')) {
                this.tableShowing.innerHTML = html;
                this.textStyle = textStyle;
            }
        } catch (error) {

        }
    },
    saveSetting() {
        setSetting('bible-showing-controller', JSON.stringify({
            textStyle: this.textStyle,
            html: this.tableShowing.outerHTML,
        }));
    },
    setRenderScroll(amount: number, isScrollUp: boolean) {
        renderPresent({
            script: `
            const ftViewer = getFullText();
            ftViewer.scrollTop += ${(isScrollUp ? 1 : -1) * amount};
        `});
    },
    setScrollTop() {
        renderPresent({
            script: `
            const ftViewer = getFullText();
            ftViewer.scrollTop = 0;
        `});
    },
    setScrollBottom() {
        renderPresent({
            script: `
            const ftViewer = getFullText();
            const table = ftViewer.querySelector('table');
            const bibleBC = ftViewer.getBoundingClientRect();
            const tableBC = table.getBoundingClientRect();
            ftViewer.scrollTop = tableBC.height - bibleBC.height;
        `});
    },
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
    },
    renderFromData(data: {
        title: string, texts: string[],
    }[] | null) {
        if (data === null) {
            this.setList([]);
            this.hide();
        } else {
            this.setList(data);
            this.show();
        }
    },
    genHtmlFTItem(renderedList: RenderedType[]) {
        const tableShowing = document.createElement('table');
        tableShowing.innerHTML = '<thead><tr></tr></thead><tbody><tr></tr></tbody>';
        if (renderedList.length) {
            renderedList.forEach(({ title }) => {
                const trHead = tableShowing.tHead?.firstChild as HTMLTableRowElement;
                const th = document.createElement('th');
                th.innerHTML = title;
                trHead.appendChild(th);
            });
            const textsLength = renderedList[0].texts.length;
            for (let i = 0; i < textsLength; i++) {
                const tr = document.createElement('tr');
                renderedList.forEach((d) => {
                    const td = document.createElement('td');
                    td.innerHTML = d.texts[i];
                    tr.appendChild(td);
                });
                const tBody = tableShowing.tBodies[0];
                tBody.appendChild(tr);
            }
        }
        return tableShowing;
    },
    genRenderList(bibleItems: BibleItem[]) {
        return Promise.all(bibleItems.map((bibleItem) => {
            return new Promise<{
                title: string, texts: string[]
            }>(async (resolve, _) => {
                const bibleTitle = await BibleItem.itemToTitle(bibleItem);
                const title = `<span class="bible">${bibleItem.bibleName}</span>|<span class="title">${bibleTitle}</span >`;
                const verses = await getVerses(bibleItem.bibleName, bibleItem.target.book, bibleItem.target.chapter);
                let text = '';
                if (verses !== null) {
                    for (let i = bibleItem.target.startVerse; i <= bibleItem.target.endVerse; i++) {
                        const verseNumb = await toLocaleNumBB(bibleItem.bibleName, i);
                        text += `<span data-highlight="${i}">
                            <span class="verse-number">${verseNumb}</span>: ${verses[`${i}`]}
                        </span>`;
                    }
                }
                resolve({ title, texts: [text] });
            });
        }));
    },
    renderLyricsList(lyric: Lyric) {
        const newList = lyric.items.map((lyricItem) => {
            const texts = lyricItem.content.split('===').map((text, i) => {
                return `<span data-highlight="${i}">${text.trim().replace(/\n/g, '<br/>')}</span>`;
            });
            return { title: lyricItem.title, texts };
        });
        this.renderFromData(newList);
    },
    show() {
        this.render();
    },
    hide() {
        presentEventListener.clearFT(true);
        renderPresent({
            script: `
            const ftViewer = getFullText();
            ftViewer.innerHTML = '';
        `});
    },
    render() {
        presentEventListener.renderFT();
        this.resetHighlight();
        this.setScrollTop();
        renderPresent({
            script: `
            const ftViewer = getFullText();
            ftViewer.innerHTML = \`${this.tableShowing.outerHTML}\`;
        `});
    },
};

export default fullTextPresentHelper;
