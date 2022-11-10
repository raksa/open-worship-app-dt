import ReactDOMServer from 'react-dom/server';
import { getVerses } from '../server/bible-helpers/bibleInfoHelpers';
import {
    getBibleLocale,
    toLocaleNumBB,
} from '../server/bible-helpers/bibleHelpers2';
import Lyric from '../lyric-list/Lyric';
import BibleItem from '../bible-list/BibleItem';
import appProviderPresent from './appProviderPresent';
import {
    BibleItemRenderedType,
    FTBibleTable,
    LyricRenderedType,
    FTLyricItem,
    BibleRenderVerseType,
} from './fullTextPresentComps';

const fullTextPresentHelper = {
    genHtmlFromFtBibleItem(bibleRenderedList: BibleItemRenderedType[],
        isLineSync: boolean) {
        if (bibleRenderedList.length === 0) {
            return document.createElement('table');
        }
        const versesCount = bibleRenderedList[0].verses.length;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<FTBibleTable
            bibleRenderedList={bibleRenderedList}
            isLineSync={isLineSync}
            versesCount={versesCount} />);
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        return div.firstChild as HTMLTableElement;
    },
    genHtmlFromFtLyric(lyricRenderedList: LyricRenderedType[],
        isLineSync: boolean) {
        if (lyricRenderedList.length === 0) {
            return document.createElement('table');
        }
        const itemsCount = lyricRenderedList[0].items.length;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<FTLyricItem
            lyricRenderedList={lyricRenderedList}
            isLineSync={isLineSync}
            itemsCount={itemsCount} />);
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
            const spanBibleKeys = table.querySelectorAll<HTMLSpanElement>('span.bible-name');
            Array.from(spanBibleKeys).forEach((spanBibleKey) => {
                spanBibleKey.addEventListener('mouseover', () => {
                    spanBibleKey.classList.add('hover');
                });
                spanBibleKey.addEventListener('mouseout', () => {
                    spanBibleKey.classList.remove('hover');
                });
                spanBibleKey.addEventListener('click', (event) => {
                    const index = Number(spanBibleKey.getAttribute('data-index'));
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
    genBibleItemRenderList(bibleItems: BibleItem[]) {
        return Promise.all(bibleItems.map((bibleItem) => {
            return new Promise<BibleItemRenderedType>(async (resolve, _) => {
                const bibleTitle = await BibleItem.itemToTitle(bibleItem);
                const verses = await getVerses(bibleItem.bibleKey,
                    bibleItem.target.book, bibleItem.target.chapter);
                const verseList: BibleRenderVerseType[] = [];
                if (verses !== null) {
                    for (let i = bibleItem.target.startVerse;
                        i <= bibleItem.target.endVerse; i++) {
                        const verseNumb = await toLocaleNumBB(bibleItem.bibleKey, i);
                        if (verseNumb !== null) {
                            verseList.push({
                                num: verseNumb,
                                text: verses[`${i}`],
                            });
                        }
                    }
                }
                const locale = await getBibleLocale(bibleItem.bibleKey);
                resolve({
                    locale,
                    bibleKey: bibleItem.bibleKey,
                    title: bibleTitle,
                    verses: verseList,
                });
            });
        }));
    },
    genLyricRenderList(lyric: Lyric) {
        return lyric.items.map(({ title, content }): LyricRenderedType => {
            const items = content.split('===').map((text, i) => {
                return {
                    num: i,
                    text: text.trim().replace(/\n/g, '<br/>'),
                };
            });
            return {
                title,
                items,
            };
        });
    },
};

export default fullTextPresentHelper;
