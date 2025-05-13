import React, { useMemo } from 'react';

import BibleItem from '../bible-list/BibleItem';
import { BibleTargetType } from '../bible-list/bibleRenderHelpers';
import { useAppStateAsync } from '../helper/debuggerHelpers';
import { showAppContextMenu } from '../context-menu/appContextMenuHelpers';
import {
    getBibleInfo,
    getVerses,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    getKJVChapterCount,
    getKJVKeyValue,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    getBibleLocale,
    toLocaleNumBible,
} from '../helper/bible-helpers/serverBibleHelpers2';
import { getLangAsync } from '../lang';

function chose<T>(
    event: any,
    isAllowAll: boolean,
    currentKey: T,
    keys: [T, string, string | undefined][],
    itemStyle: React.CSSProperties = {},
) {
    return new Promise<T | null>((resolve) => {
        showAppContextMenu(
            event,
            keys.map(([key, value1, value2]) => {
                return {
                    menuTitle: value1,
                    title: value2,
                    disabled: !isAllowAll && key === currentKey,
                    onSelect: () => {
                        resolve(key);
                    },
                    style: itemStyle,
                };
            }),
        );
    });
}
async function getBookList(bibleKey: string) {
    const info = await getBibleInfo(bibleKey);
    if (info === null) {
        return null;
    }
    const bookKVList = info.books;
    const booksAvailable = info.booksAvailable;
    const kjvKeyValue = getKJVKeyValue();
    const bookList = Object.entries(bookKVList)
        .filter(([bookKey]) => {
            return booksAvailable.includes(bookKey);
        })
        .map(([bookKey, book]) => {
            return [bookKey, book, kjvKeyValue[bookKey]] as [
                string,
                string,
                string,
            ];
        });
    return bookList;
}
async function getNumItem(bibleKey: string, n: number) {
    const localeNum = await toLocaleNumBible(bibleKey, n);
    return [n, localeNum, n.toString()] as [number, string, string];
}
export default function BibleViewTitleEditorComp({
    bibleItem,
    onTargetChange,
}: Readonly<{
    bibleItem: BibleItem;
    onTargetChange?: (target: BibleTargetType) => void;
}>) {
    const { value: title } = useAppStateAsync(bibleItem.toTitle(), [bibleItem]);
    const { bibleKey, target } = bibleItem;
    const { value: fontFamily } = useAppStateAsync(
        new Promise<string>((resolve) => {
            (async () => {
                const locale = await getBibleLocale(bibleKey);
                const langData = await getLangAsync(locale);
                resolve(langData?.fontFamily ?? '');
            })();
        }),
        [bibleKey],
    );
    const [book, localeChapter, localeVerseStart, localeVerseEnd] =
        useMemo(() => {
            if (!title) {
                return [
                    target.bookKey,
                    target.chapter.toString(),
                    target.verseStart.toString(),
                    target.verseStart !== target.verseEnd
                        ? target.verseEnd.toString()
                        : undefined,
                ];
            }
            let arr = title.split(':');
            const verses = arr.pop()?.split('-');
            arr = arr[0].split(' ');
            const chapter = arr.pop();
            const book = arr.join(' ');
            return [book, chapter!, verses![0], verses?.[1]];
        }, [target, title]);
    if (onTargetChange === undefined) {
        return <span>{title}</span>;
    }
    const genEditor = (
        text: string,
        onClick: (event: any) => Promise<void>,
    ) => {
        return (
            <span className="pointer app-caught-hover" onClick={onClick}>
                {text}
            </span>
        );
    };
    const choseChapter = async (
        event: any,
        isAllowAll: boolean,
        bookKey = target.bookKey,
    ) => {
        const chapterCount = getKJVChapterCount(bookKey);
        const chapterList = await Promise.all(
            Array.from({ length: chapterCount }, (_, i) => {
                return getNumItem(bibleKey, i + 1);
            }),
        );
        chapterList.unshift([target.chapter, 'Chapter', 'Chapter']);
        return await chose(event, isAllowAll, target.chapter, chapterList, {
            fontFamily: fontFamily ?? '',
        });
    };
    const choseVerseStart = async (
        event: any,
        isAllowAll: boolean,
        bookKey = target.bookKey,
        chapter = target.chapter,
    ) => {
        const verses = await getVerses(bibleKey, bookKey, chapter);
        if (verses === null) {
            return null;
        }
        const verseCount = Object.keys(verses).length;
        const verseList = await Promise.all(
            Array.from({ length: verseCount }, (_, i) => {
                return i + 1;
            })
                .filter((n) => {
                    return isAllowAll || n <= target.verseEnd;
                })
                .map((n) => {
                    return getNumItem(bibleKey, n);
                }),
        );
        verseList.unshift([target.verseStart, 'Verse Start', 'Verse Start']);
        return await chose(event, isAllowAll, target.verseStart, verseList, {
            fontFamily: fontFamily ?? '',
        });
    };
    const choseVerseEnd = async (
        event: any,
        isAllowAll: boolean,
        bookKey = target.bookKey,
        chapter = target.chapter,
        verseStart = target.verseStart,
    ) => {
        const verses = await getVerses(bibleKey, bookKey, chapter);
        if (verses === null) {
            return null;
        }
        const verseCount = Object.keys(verses).length;
        const verseList = await Promise.all(
            Array.from({ length: verseCount }, (_, i) => {
                return i + 1;
            })
                .filter((n) => {
                    return n >= verseStart;
                })
                .map((n) => {
                    return getNumItem(bibleKey, n);
                }),
        );
        verseList.unshift([target.verseEnd, 'Verse End', 'Verse End']);
        return await chose(event, isAllowAll, target.verseEnd, verseList, {
            fontFamily: fontFamily ?? '',
        });
    };
    const applyTarget = (
        bookKey: string,
        chapter: number,
        verseStart: number,
        verseEnd: number,
    ) => {
        onTargetChange({
            bookKey,
            chapter,
            verseStart,
            verseEnd,
        });
    };
    return (
        <span>
            {genEditor(book, async (event) => {
                const bookKVList = await getBookList(bibleKey);
                if (bookKVList === null) {
                    return;
                }
                bookKVList.unshift([target.bookKey, 'Book', 'Book']);
                const newBook = await chose(
                    event,
                    false,
                    target.bookKey,
                    bookKVList,
                    {
                        fontFamily: fontFamily ?? '',
                    },
                );
                if (newBook === null) {
                    return;
                }
                const newChapter = await choseChapter(event, true, newBook);
                if (newChapter === null) {
                    return;
                }
                const newVerseStart = await choseVerseStart(
                    event,
                    true,
                    newBook,
                    newChapter,
                );
                if (newVerseStart === null) {
                    return;
                }
                const newVerseEnd = await choseVerseEnd(
                    event,
                    true,
                    newBook,
                    newChapter,
                    newVerseStart,
                );
                if (newVerseEnd === null) {
                    return;
                }
                applyTarget(newBook, newChapter, newVerseStart, newVerseEnd);
            })}{' '}
            {genEditor(localeChapter, async (event) => {
                const newChapter = await choseChapter(event, false);
                if (newChapter === null) {
                    return;
                }
                const newVerseStart = await choseVerseStart(
                    event,
                    true,
                    target.bookKey,
                    newChapter,
                );
                if (newVerseStart === null) {
                    return;
                }
                const newVerseEnd = await choseVerseEnd(
                    event,
                    true,
                    target.bookKey,
                    newChapter,
                    newVerseStart,
                );
                if (newVerseEnd === null) {
                    return;
                }
                applyTarget(
                    target.bookKey,
                    newChapter,
                    newVerseStart,
                    newVerseEnd,
                );
            })}
            {':'}
            {genEditor(localeVerseStart, async (event) => {
                const newVerseStart = await choseVerseStart(
                    event,
                    false,
                    target.bookKey,
                    target.chapter,
                );
                if (newVerseStart === null) {
                    return;
                }
                const newVerseEnd = await choseVerseEnd(
                    event,
                    true,
                    target.bookKey,
                    target.chapter,
                    newVerseStart,
                );
                if (newVerseEnd === null) {
                    return;
                }
                applyTarget(
                    target.bookKey,
                    target.chapter,
                    newVerseStart,
                    newVerseEnd,
                );
            })}
            {localeVerseEnd ? '-' : ''}
            {localeVerseEnd
                ? genEditor(localeVerseEnd, async (event) => {
                      const newVerseEnd = await choseVerseEnd(
                          event,
                          false,
                          target.bookKey,
                          target.chapter,
                      );
                      if (newVerseEnd === null) {
                          return;
                      }
                      applyTarget(
                          target.bookKey,
                          target.chapter,
                          target.verseStart,
                          newVerseEnd,
                      );
                  })
                : null}
        </span>
    );
}
