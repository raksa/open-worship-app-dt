import ReactDOMServer from 'react-dom/server';
import { getVerses } from '../helper/bible-helpers/bibleInfoHelpers';
import {
    getBibleLocale, toLocaleNumBB,
} from '../helper/bible-helpers/serverBibleHelpers2';
import Lyric from '../lyric-list/Lyric';
import BibleItem from '../bible-list/BibleItem';
import appProviderScreen from './appProviderScreen';
import {
    BibleItemRenderedType, FTBibleTable, LyricRenderedType, FTLyricItem,
    BibleRenderVerseType,
} from './fullTextScreenComps';

const fullTextScreenHelper = {
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
        const targets = parent.querySelectorAll<HTMLSpanElement>(
            `span.${className}`,
        );
        const arrChildren = Array.from(targets);
        arrChildren.forEach((target) => {
            target.classList.remove(className);
        });
        return arrChildren;
    },
    resetClassName(
        parent: HTMLElement, className: string, isAdd: boolean,
        blockId?: string,
    ) {
        const currentBlocks = parent.querySelectorAll(
            `[data-highlight="${blockId}"]`,
        );
        for (const currentBlock of currentBlocks) {
            if (isAdd) {
                currentBlock.classList.add(className);
            } else {
                currentBlock.classList.remove(className);
            }
        }
    },
    registerHighlight(table: HTMLTableElement, {
        onSelectIndex, onBibleSelect,
    }: {
        onSelectIndex: (selectedIndex: number | null) => void,
        onBibleSelect: (event: MouseEvent, index: number) => void,
    }) {
        if (!appProviderScreen.isScreen) {
            const divBibleKeys = table.querySelectorAll<HTMLSpanElement>(
                'div.bible-name',
            );
            Array.from(divBibleKeys).forEach((divBibleKey) => {
                divBibleKey.addEventListener('mouseover', () => {
                    divBibleKey.classList.add('hover');
                });
                divBibleKey.addEventListener('mouseout', () => {
                    divBibleKey.classList.remove('hover');
                });
                divBibleKey.addEventListener('click', (event) => {
                    const index = Number(divBibleKey.getAttribute(
                        'data-index',
                    ));
                    onBibleSelect(event, index);
                });
            });
        }
        const spans = table.querySelectorAll<HTMLSpanElement>('span.highlight');
        Array.from(spans).forEach((span) => {
            span.addEventListener('mouseover', () => {
                this.resetClassName(
                    table, 'hover', true, span.dataset.highlight,
                );
            });
            span.addEventListener('mouseout', () => {
                this.resetClassName(
                    table, 'hover', false, span.dataset.highlight,
                );
            });
            span.addEventListener('click', () => {
                const arrChildren = this.removeClassName(table, 'selected');
                if (
                    !arrChildren.includes(span) && span.dataset.highlight
                    && !isNaN(parseInt(span.dataset.highlight, 10))
                ) {
                    onSelectIndex(parseInt(span.dataset.highlight, 10));
                } else {
                    onSelectIndex(null);
                }
            });
        });
    },
    genBibleItemRenderList(bibleItems: BibleItem[]) {
        return Promise.all(bibleItems.map((bibleItem) => {
            return new Promise<BibleItemRenderedType>((resolve, _) => {
                (async () => {
                    const bibleTitle = await bibleItem.toTitle();
                    const verses = await getVerses(bibleItem.bibleKey,
                        bibleItem.target.bookKey, bibleItem.target.chapter);
                    const verseList: BibleRenderVerseType[] = [];
                    if (verses !== null) {
                        for (let i = bibleItem.target.verseStart;
                            i <= bibleItem.target.verseEnd; i++) {
                            const verseNumb = await toLocaleNumBB(
                                bibleItem.bibleKey, i,
                            );
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
                })();
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

export default fullTextScreenHelper;
