import { getVerses } from '../server/bible-helpers/bibleHelpers1';
import {
    getBibleLocale,
    toLocaleNumBB,
} from '../server/bible-helpers/bibleHelpers2';
import { removePX } from '../helper/helpers';
import Lyric from '../lyric-list/Lyric';
import { getSetting, setSetting } from '../helper/settingHelper';
import { AppColorType, BLACK_COLOR } from '../others/ColorPicker';
import { HIGHLIGHT_HOVER_SETTING } from '../full-text-present/Utils';
import BibleItem from '../bible-list/BibleItem';
import { renderPresent } from '../helper/presentingHelpers';
import ReactDOMServer from 'react-dom/server';
import { getFontFamilyByLocal, LocaleType } from '../lang';
import appProviderPresent from './appProviderPresent';

type StylingType = {
    color?: AppColorType;
    fontSize?: number;
    textShadow?: string;
};
type BibleRenderVerseType = {
    num: string,
    text: string,
};
export type BibleRenderedType = {
    locale: LocaleType,
    bibleName: string,
    title: string,
    verses: BibleRenderVerseType[]
};
export type LyricRenderedType = {
    title: string,
    items: string[]
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
    },
    genHtmlFTItem(bibleRenderedList: BibleRenderedType[],
        isLineSync: boolean) {
        if (bibleRenderedList.length === 0) {
            return document.createElement('table');
        }
        const versesCount = bibleRenderedList[0].verses.length;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<table>
            <thead><tr>
                {bibleRenderedList.map(({ locale, bibleName, title }, i) => {
                    return (
                        <th key={i} style={{
                            fontFamily: getFontFamilyByLocal(locale),
                        }}>
                            <span className='bible highlight bible-name'
                                data-index={i}>
                                {bibleName}
                            </span>
                            |<span className='title'>{title}</span >
                        </th>
                    );
                })}
            </tr>
            </thead>
            <tbody>
                {isLineSync ? Array.from({ length: versesCount }).map((_, i) => {
                    return (
                        <tr key={i}>
                            {bibleRenderedList.map(({ locale, verses }, j) => {
                                const { num, text } = verses[i];
                                return (
                                    <td key={j} style={{
                                        fontFamily: getFontFamilyByLocal(locale),
                                    }}>
                                        <span className='highlight' data-highlight={i}>
                                            <span className='verse-number'>{num}</span>
                                            : {text}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    );
                }) : <tr>
                    {bibleRenderedList.map(({ locale, verses }, i) => {
                        return (
                            <td key={i}>
                                {verses.map(({ num, text }, j) => {
                                    return (
                                        <span key={j} className='highlight'
                                            style={{
                                                fontFamily: getFontFamilyByLocal(locale),
                                            }}
                                            data-highlight={j}>
                                            <span className='verse-number'>{num}</span>
                                            : {text}
                                        </span>
                                    );
                                })}
                            </td>
                        );
                    })}
                </tr>}
            </tbody>
        </table>);
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        return div.firstChild as HTMLTableElement;
    },
    removeClassName(parent: HTMLElement, className: string) {
        const targets = parent.querySelectorAll<HTMLSpanElement>(`span.${className}`);
        const arrChildren = Array.from(targets);
        arrChildren.forEach((target) => {
            target.classList.remove(className);
        });
        return arrChildren;
    },
    resetClassName(parent: HTMLElement, className: string, isAdd: boolean, blockId?: string) {
        const currentBlocks = parent.querySelectorAll(`[data-highlight="${blockId}"]`);
        Array.from(currentBlocks).forEach((currentBlock) => {
            if (isAdd) {
                currentBlock.classList.add(className);
            } else {
                currentBlock.classList.remove(className);
            }
        });
    },
    registerHighlight(table: HTMLTableElement, {
        onSelectIndex, onBibleSelect,
    }: {
        onSelectIndex: (selectedIndex: number | null) => void,
        onBibleSelect: (event: MouseEvent, index: number) => void,
    }) {
        if (!appProviderPresent.isPresent) {
            const spanBibleNames = table.querySelectorAll<HTMLSpanElement>('span.bible-name');
            Array.from(spanBibleNames).forEach((spanBibleName) => {
                spanBibleName.addEventListener('mouseover', () => {
                    spanBibleName.classList.add('hover');
                });
                spanBibleName.addEventListener('mouseout', () => {
                    spanBibleName.classList.remove('hover');
                });
                spanBibleName.addEventListener('click', (event) => {
                    const index = Number(spanBibleName.getAttribute('data-index'));
                    onBibleSelect(event, index);
                });
            });
        }
        const spans = table.querySelectorAll<HTMLSpanElement>('span.highlight');
        Array.from(spans).forEach((span) => {
            span.addEventListener('mouseover', () => {
                this.resetClassName(table, 'hover', true, span.dataset.highlight);
            });
            span.addEventListener('mouseout', () => {
                this.resetClassName(table, 'hover', false, span.dataset.highlight);
            });
            span.addEventListener('click', () => {
                const arrChildren = this.removeClassName(table, 'selected');
                if (!arrChildren.includes(span) && span.dataset.highlight
                    && !isNaN(+span.dataset.highlight)) {
                    onSelectIndex(+span.dataset.highlight);
                } else {
                    onSelectIndex(null);
                }
            });
        });
    },
    genRenderList(bibleItems: BibleItem[]) {
        return Promise.all(bibleItems.map((bibleItem) => {
            return new Promise<BibleRenderedType>(async (resolve, _) => {
                const bibleTitle = await BibleItem.itemToTitle(bibleItem);
                const verses = await getVerses(bibleItem.bibleName, bibleItem.target.book, bibleItem.target.chapter);
                const verseList: BibleRenderVerseType[] = [];
                if (verses !== null) {
                    for (let i = bibleItem.target.startVerse; i <= bibleItem.target.endVerse; i++) {
                        const verseNumb = await toLocaleNumBB(bibleItem.bibleName, i);
                        if (verseNumb !== null) {
                            verseList.push({
                                num: verseNumb,
                                text: verses[`${i}`],
                            });
                        }
                    }
                }
                const locale = await getBibleLocale(bibleItem.bibleName);
                resolve({
                    locale,
                    bibleName: bibleItem.bibleName,
                    title: bibleTitle,
                    verses: verseList,
                });
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
    render() {
        this.resetHighlight();
        renderPresent({
            script: `
            const ftViewer = getFullText();
            ftViewer.innerHTML = \`${this.tableShowing.outerHTML
                }\`;
        `});
    },
};

export default fullTextPresentHelper;
