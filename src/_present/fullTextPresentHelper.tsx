import { getVerses } from '../server/bible-helpers/bibleHelpers1';
import {
    getBibleLocale,
    toLocaleNumBB,
} from '../server/bible-helpers/bibleHelpers2';
import Lyric from '../lyric-list/Lyric';
import BibleItem from '../bible-list/BibleItem';
import ReactDOMServer from 'react-dom/server';
import { getFontFamilyByLocal, LocaleType } from '../lang';
import appProviderPresent from './appProviderPresent';
import { Fragment } from 'react';

type BibleRenderVerseType = {
    num: string,
    text: string,
};
export type BibleItemRenderedType = {
    locale: LocaleType,
    bibleName: string,
    title: string,
    verses: BibleRenderVerseType[]
};
export type LyricRenderedType = {
    title: string,
    items: {
        num: number,
        text: string,
    }[]
};
const fullTextPresentHelper = {
    genHtmlFromFtBibleItem(bibleRenderedList: BibleItemRenderedType[],
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
    genHtmlFromFtLyric(lyricRenderedList: LyricRenderedType[],
        isLineSync: boolean) {
        if (lyricRenderedList.length === 0) {
            return document.createElement('table');
        }
        const itemsCount = lyricRenderedList[0].items.length;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<table>
            <thead><tr>
                {lyricRenderedList.map(({ title }, i) => {
                    return (
                        <th key={i}>
                            <span className='title'>{title}</span >
                        </th>
                    );
                })}
            </tr>
            </thead>
            <tbody>
                {isLineSync ? Array.from({ length: itemsCount }).map((_, i) => {
                    return (
                        <tr key={i}>
                            {lyricRenderedList.map(({ items }, j) => {
                                const { num, text } = items[i];
                                return (
                                    <td key={j}>
                                        <span data-highlight={num}>
                                            {text}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    );
                }) : <tr>
                    {lyricRenderedList.map(({ items }, i) => {
                        return (
                            <td key={i}>
                                {items.map(({ num, text }, j) => {
                                    return (
                                        <Fragment key={j}>
                                            <span className='highlight'
                                                data-highlight={j}>
                                                <span className='verse-number'>{num}</span>
                                                : {text}
                                            </span>
                                            <br />
                                        </Fragment>
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
    genBibleItemRenderList(bibleItems: BibleItem[]) {
        return Promise.all(bibleItems.map((bibleItem) => {
            return new Promise<BibleItemRenderedType>(async (resolve, _) => {
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
