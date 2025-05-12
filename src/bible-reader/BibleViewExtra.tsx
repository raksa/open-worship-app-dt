import React, { createContext, use, useMemo } from 'react';

import BibleItem from '../bible-list/BibleItem';
import { BibleSelectionMiniComp } from '../bible-lookup/BibleSelectionComp';
import {
    BIBLE_VIEW_TEXT_CLASS,
    fontSizeToHeightStyle,
    useBibleViewFontSizeContext,
} from '../helper/bibleViewHelpers';
import ItemColorNoteComp from '../others/ItemColorNoteComp';
import ColorNoteInf from '../helper/ColorNoteInf';
import { useBibleItemViewControllerContext } from './BibleItemViewController';
import { useBibleItemContext } from './BibleItemContext';
import { BIBLE_VERSE_TEXT_TITLE } from '../helper/helpers';
import {
    BibleTargetType,
    CompiledVerseType,
} from '../bible-list/bibleRenderHelpers';
import { useAppStateAsync } from '../helper/debuggerHelpers';
import { setBibleLookupInputFocus } from '../bible-lookup/selectionHelpers';
import { showAppContextMenu } from '../context-menu/appContextMenuHelpers';
import {
    getBibleInfo,
    getVerses,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    getKJVChapterCount,
    getKJVKeyValue,
} from '../helper/bible-helpers/serverBibleHelpers';

export const BibleViewTitleMaterialContext = createContext<{
    titleElement: React.ReactNode;
} | null>(null);

export function useBibleViewTitleMaterialContext() {
    const context = use(BibleViewTitleMaterialContext);
    if (context === null) {
        throw new Error(
            'useBibleViewTitleMaterialContext must be used within a ' +
                'BibleViewTitleMaterialContext.Provider',
        );
    }
    return context;
}

export function RenderTitleMaterialComp({
    editingBibleItem,
    onBibleKeyChange,
}: Readonly<{
    editingBibleItem?: BibleItem;
    onBibleKeyChange?: (oldBibleKey: string, newBibleKey: string) => void;
}>) {
    const bibleItem = useBibleItemContext();
    const viewController = useBibleItemViewControllerContext();
    const materialContext = useBibleViewTitleMaterialContext();
    const colorNoteHandler: ColorNoteInf = {
        getColorNote: async () => {
            return viewController.getColorNote(editingBibleItem ?? bibleItem);
        },
        setColorNote: async (color) => {
            viewController.setColorNote(editingBibleItem ?? bibleItem, color);
        },
    };
    return (
        <div
            className="d-flex text-nowrap w-100 h-100"
            style={{
                overflowX: 'auto',
            }}
        >
            <ItemColorNoteComp item={colorNoteHandler} />
            <div className="d-flex flex-fill">
                <div className="d-flex ps-1">
                    <div style={{ margin: 'auto' }}>
                        <BibleSelectionMiniComp
                            bibleKey={bibleItem.bibleKey}
                            onBibleKeyChange={onBibleKeyChange}
                        />
                    </div>
                </div>
                <div className="flex-item">{materialContext.titleElement}</div>
            </div>
        </div>
    );
}

export function RenderHeaderComp({
    onChange,
    onClose,
}: Readonly<{
    onChange: (oldBibleKey: string, newBibleKey: string) => void;
    onClose: () => void;
}>) {
    const fontSize = useBibleViewFontSizeContext();
    return (
        <div
            className="card-header d-flex app-top-hover-visible"
            style={{ ...fontSizeToHeightStyle(fontSize) }}
        >
            <RenderTitleMaterialComp onBibleKeyChange={onChange} />
            <div>
                <button
                    className="btn-close"
                    onClick={() => {
                        onClose();
                    }}
                />
            </div>
        </div>
    );
}

export function BibleDirectViewTitleComp({
    bibleItem,
}: Readonly<{ bibleItem: BibleItem }>) {
    const { value: title } = useAppStateAsync(bibleItem.toTitle(), [bibleItem]);
    return (
        <span
            data-bible-key={bibleItem.bibleKey}
            className="title app-border-white-round m-1 px-1"
        >
            {title}
        </span>
    );
}

export function BibleViewTitleComp({
    onDBClick,
    onPencilClick,
}: Readonly<{
    onDBClick?: (event: any) => void;
    onPencilClick?: (event: any) => void;
}> = {}) {
    const bibleItem = useBibleItemContext();
    const { value: title } = useAppStateAsync(bibleItem.toTitle(), [bibleItem]);
    const fontSize = useBibleViewFontSizeContext();
    return (
        <span
            className="title"
            data-bible-key={bibleItem.bibleKey}
            style={{ fontSize }}
            title={onDBClick !== undefined ? 'Double click to edit' : undefined}
            onDoubleClick={onDBClick}
        >
            {title}{' '}
            {onPencilClick ? (
                <span
                    className="pointer app-low-hover-visible"
                    style={{ color: 'green' }}
                    onClick={() => {
                        onPencilClick(bibleItem);
                    }}
                >
                    <i className="bi bi-pencil" />
                </span>
            ) : null}
        </span>
    );
}

function chose<T>(
    event: any,
    currentKey: T,
    keys: [T, string, string | undefined][],
) {
    return new Promise<T | null>((resolve) => {
        showAppContextMenu(
            event,
            keys.map(([key, value1, value2]) => {
                return {
                    menuTitle: value1,
                    title: value2,
                    disabled: key === currentKey,
                    onSelect: () => {
                        resolve(key);
                    },
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
export function BibleViewTitleEditableComp({
    bibleItem,
    onTargetChange,
}: Readonly<{
    bibleItem: BibleItem;
    onTargetChange?: (target: BibleTargetType) => void;
}>) {
    const { value: title } = useAppStateAsync(bibleItem.toTitle(), [bibleItem]);
    const { target } = bibleItem;
    const [book, localeChapter, localeVerses] = useMemo(() => {
        if (!title) {
            return [
                target.bookKey,
                target.chapter.toString(),
                `${target.verseStart}-${target.verseEnd}`,
            ];
        }
        const arr = title.split(' ');
        return [arr[0], ...arr[1].split(':')];
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
    const choseChapter = async (event: any, bookKey = target.bookKey) => {
        const chapterCount = getKJVChapterCount(bookKey);
        return await chose(
            event,
            target.chapter,
            Array.from({ length: chapterCount }, (_, i) => {
                return [i + 1, `${i + 1}`, `${i + 1}`];
            }),
        );
    };
    const choseVerses = async (
        event: any,
        bookKey = target.bookKey,
        chapter = target.chapter,
    ) => {
        const verses = await getVerses(bibleItem.bibleKey, bookKey, chapter);
        if (verses === null) {
            return null;
        }
        const verseCount = Object.keys(verses).length;
        return await chose(
            event,
            target.verseStart,
            Array.from({ length: verseCount }, (_, i) => {
                return [i + 1, `${i + 1}`, `${i + 1}`];
            }),
        );
    };
    return (
        <span>
            {genEditor(book, async (event) => {
                const bookKVList = await getBookList(bibleItem.bibleKey);
                if (bookKVList === null) {
                    return;
                }
                const newBook = await chose(event, target.bookKey, bookKVList);
                if (newBook === null) {
                    return;
                }
                const newChapter = await choseChapter(event, newBook);
                if (newChapter === null) {
                    return;
                }
                const newVerses = await choseVerses(event, newBook, newChapter);
                console.log(newBook, newChapter, newVerses);
            })}{' '}
            {genEditor(localeChapter, async (event) => {
                const newChapter = await choseChapter(event);
                if (newChapter === null) {
                    return;
                }
                const newVerses = await choseVerses(
                    event,
                    target.bookKey,
                    newChapter,
                );
                console.log(target.bookKey, newChapter, newVerses);
            })}
            {':'}
            {genEditor(localeVerses, async (event) => {
                const newVerses = await choseVerses(
                    event,
                    target.bookKey,
                    target.chapter,
                );
                console.log(target.bookKey, target.chapter, newVerses);
            })}
        </span>
    );
}

export function BibleViewTitleEditingComp() {
    const bibleItem = useBibleItemContext();
    const fontSize = useBibleViewFontSizeContext();
    return (
        <span
            className="title"
            data-bible-key={bibleItem.bibleKey}
            style={{ fontSize }}
        >
            <BibleViewTitleEditableComp
                bibleItem={bibleItem}
                onTargetChange={(newBibleTarget) => {
                    console.log(newBibleTarget);
                }}
            />{' '}
            <span
                className="pointer"
                title='Hit "Escape" to force edit'
                onClick={() => {
                    setBibleLookupInputFocus();
                }}
            >
                <i style={{ color: 'green' }} className="bi bi-pencil-fill" />
            </span>
        </span>
    );
}

function RendVerseTextComp({
    bibleItem,
    verseInfo,
    index,
}: Readonly<{
    bibleItem: BibleItem;
    verseInfo: CompiledVerseType;
    index: number;
}>) {
    const viewController = useBibleItemViewControllerContext();
    return (
        <>
            {viewController.shouldNewLine &&
            verseInfo.isNewLine &&
            index > 0 ? (
                <br />
            ) : null}
            <div className="verse-number">
                <div data-bible-key={verseInfo.bibleKey}>
                    {verseInfo.isNewLine ? (
                        <span className="verse-number-text">&nbsp;&nbsp;</span>
                    ) : null}
                    {verseInfo.localeVerse}
                </div>
            </div>
            <div
                className="verse-text"
                data-bible-key={verseInfo.bibleKey}
                data-kjv-verse-key={verseInfo.kjvBibleVersesKey}
                data-verse-key={verseInfo.bibleVersesKey}
                title={BIBLE_VERSE_TEXT_TITLE}
                onClick={(event) => {
                    viewController.handleVersesSelecting(
                        event.currentTarget,
                        event.altKey,
                        false,
                        bibleItem,
                    );
                }}
                onDoubleClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    const selection = window.getSelection();
                    if (selection !== null && selection.rangeCount > 0) {
                        selection.removeAllRanges();
                    }
                    viewController.handleVersesSelecting(
                        event.currentTarget,
                        true,
                        false,
                        bibleItem,
                    );
                }}
            >
                {verseInfo.text}
            </div>
        </>
    );
}

export function BibleViewTextComp() {
    const bibleItem = useBibleItemContext();
    const fontSize = useBibleViewFontSizeContext();
    const { value: result } = useAppStateAsync(bibleItem.toVerseTextList(), [
        bibleItem,
    ]);
    if (!result) {
        return null;
    }
    return (
        <div
            className={`${BIBLE_VIEW_TEXT_CLASS} app-selectable-text pt-3`}
            data-bible-item-id={bibleItem.id}
            style={{
                fontSize: `${fontSize}px`,
                paddingBottom: '100px',
            }}
        >
            {result.map((verseInfo, i) => {
                return (
                    <RendVerseTextComp
                        key={verseInfo.localeVerse}
                        bibleItem={bibleItem}
                        verseInfo={verseInfo}
                        index={i}
                    />
                );
            })}
        </div>
    );
}
