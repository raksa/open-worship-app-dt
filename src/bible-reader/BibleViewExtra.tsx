import React, { createContext, use } from 'react';

import BibleItem from '../bible-list/BibleItem';
import { BibleSelectionMiniComp } from '../bible-lookup/BibleSelectionComp';
import { useGetBibleRef } from '../others/bibleRefsHelpers';
import {
    useBibleItemRenderTitle,
    useBibleItemVerseTextList,
} from '../bible-list/bibleItemHelpers';
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
import { CompiledVerseType } from '../bible-list/bibleRenderHelpers';

export function RenderTitleMaterialComp({
    editingBibleItem,
    onBibleKeyChange,
}: Readonly<{
    editingBibleItem?: BibleItem;
    onBibleKeyChange?: (oldBibleKey: string, newBibleKey: string) => void;
}>) {
    const bibleItem = useBibleItemContext();
    const viewController = useBibleItemViewControllerContext();
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
                <div className="flex-item">
                    <BibleViewTitleComp />
                </div>
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

export const BibleViewTitleMaterialContext = createContext<{
    onDBClick?: (bibleItem: BibleItem) => void;
    extraHeader?: React.ReactNode;
} | null>(null);

export function BibleViewTitleComp() {
    const bibleItem = useBibleItemContext();
    const materialContext = use(BibleViewTitleMaterialContext);
    const title = useBibleItemRenderTitle(bibleItem);
    const fontSize = useBibleViewFontSizeContext();
    return (
        <span
            className="title debugger-text"
            data-bible-key={bibleItem.bibleKey}
            style={{ fontSize }}
            title={
                materialContext !== null ? 'Double click to edit' : undefined
            }
            onDoubleClick={() => {
                if (materialContext !== null) {
                    materialContext.onDBClick?.(bibleItem);
                }
            }}
        >
            {title}
            {materialContext?.extraHeader}
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
                data-verse-key={verseInfo.kjvBibleVersesKey}
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
    const result = useBibleItemVerseTextList(bibleItem);
    if (result === null) {
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

function RefItemRendererComp({
    bookKey,
    chapter,
    verse,
}: Readonly<{
    bookKey: string;
    chapter: number;
    verse: number;
}>) {
    const bibleRef = useGetBibleRef(bookKey, chapter, verse);
    return (
        <div>
            <hr />
            {bibleRef !== null && <code>{JSON.stringify(bibleRef)}</code>}
        </div>
    );
}

export function RefRendererComp() {
    const bibleItem = useBibleItemContext();
    const { bookKey: book, chapter, verseStart, verseEnd } = bibleItem.target;
    const arr: number[] = [];
    for (let i = verseStart; i <= verseEnd; i++) {
        arr.push(i);
    }
    return (
        <>
            {arr.map((verse) => {
                return (
                    <RefItemRendererComp
                        key={verse}
                        bookKey={book}
                        chapter={chapter}
                        verse={verse}
                    />
                );
            })}
        </>
    );
}
