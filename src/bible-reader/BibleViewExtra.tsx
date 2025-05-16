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
import { useBibleItemViewControllerContext } from './BibleItemsViewController';
import { useBibleItemContext } from './BibleItemContext';
import { BIBLE_VERSE_TEXT_TITLE } from '../helper/helpers';
import {
    BibleTargetType,
    CompiledVerseType,
} from '../bible-list/bibleRenderHelpers';
import { useAppStateAsync } from '../helper/debuggerHelpers';
import BibleViewTitleEditorComp from './BibleViewTitleEditorComp';
import {
    getVersesCount,
    toLocaleNumBible,
} from '../helper/bible-helpers/serverBibleHelpers2';

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
                    className="pointer app-low-hover-visible app-caught-hover"
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

export function BibleViewTitleEditingComp({
    onTargetChange,
    children,
}: Readonly<{
    onTargetChange: (bibleTarget: BibleTargetType) => void;
    children?: React.ReactNode;
}>) {
    const bibleItem = useBibleItemContext();
    const fontSize = useBibleViewFontSizeContext();
    return (
        <span
            className="title"
            data-bible-key={bibleItem.bibleKey}
            style={{ fontSize }}
        >
            <BibleViewTitleEditorComp
                bibleItem={bibleItem}
                onTargetChange={onTargetChange}
            />{' '}
            {children}
        </span>
    );
}

function RenderVerseTextComp({
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

function RenderRestVerseNumListComp({
    to,
    from,
    bibleItem,
    verseCount,
}: Readonly<{
    to?: number;
    from?: number;
    bibleItem: BibleItem;
    verseCount: number;
}>) {
    const actualFrom = from ?? 1;
    const actualTo = to ?? verseCount;
    const numList = useMemo(() => {
        const list = [];
        for (let i = actualFrom; i <= actualTo; i++) {
            list.push(i);
        }
        return list;
    }, [actualFrom, actualTo]);
    const { value: localeVerseList } = useAppStateAsync(
        Promise.all(
            numList.map((verse) => {
                return toLocaleNumBible(bibleItem.bibleKey, verse);
            }),
        ),
        [bibleItem.bibleKey, numList],
    );
    if (!localeVerseList || localeVerseList.length === 0) {
        return null;
    }
    return (
        <>
            {from !== undefined ? <br /> : null}
            {numList.map((verse, i) => {
                return (
                    <div key={verse} className="verse-number">
                        <div
                            className="verse-number-rest"
                            data-bible-key={bibleItem.bibleKey}
                            title={verse.toString()}
                        >
                            {localeVerseList[i]}
                        </div>
                    </div>
                );
            })}
            {top !== undefined ? <br /> : null}
        </>
    );
}

export function BibleViewTextComp() {
    const bibleItem = useBibleItemContext();
    const { bibleKey, target } = bibleItem;
    const fontSize = useBibleViewFontSizeContext();
    const { value: verseList } = useAppStateAsync(bibleItem.toVerseTextList(), [
        bibleItem,
    ]);
    const { value: verseCount } = useAppStateAsync(
        getVersesCount(bibleKey, target.bookKey, target.chapter),
        [bibleKey, target.bookKey, target.chapter],
    );
    if (!verseList || !verseCount) {
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
            <RenderRestVerseNumListComp
                to={target.verseStart - 1}
                bibleItem={bibleItem}
                verseCount={verseCount}
            />
            {verseList.map((verseInfo, i) => {
                return (
                    <RenderVerseTextComp
                        key={verseInfo.localeVerse}
                        bibleItem={bibleItem}
                        verseInfo={verseInfo}
                        index={i}
                    />
                );
            })}
            <RenderRestVerseNumListComp
                from={target.verseEnd + 1}
                bibleItem={bibleItem}
                verseCount={verseCount}
            />
        </div>
    );
}
