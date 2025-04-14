import { createContext, Fragment, use } from 'react';

import BibleItem from '../bible-list/BibleItem';
import { BibleSelectionMiniComp } from '../bible-lookup/BibleSelectionComp';
import { useGetBibleRef } from '../others/bibleRefsHelpers';
import {
    useBibleItemRenderTitle,
    useBibleItemVerseTextList,
} from '../bible-list/bibleItemHelpers';
import {
    fontSizeToHeightStyle,
    useBibleViewFontSizeContext,
} from '../helper/bibleViewHelpers';
import ItemColorNoteComp from '../others/ItemColorNoteComp';
import ColorNoteInf from '../helper/ColorNoteInf';
import { useBibleItemViewControllerContext } from './BibleItemViewController';
import { useBibleItemContext } from './BibleItemContext';
import { bringDomToNearestView, handleToViewBringing } from '../helper/helpers';

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
            className="card-header d-flex"
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
    onDBClick: (bibleItem: BibleItem) => void;
} | null>(null);

export function BibleViewTitleComp() {
    const bibleItem = useBibleItemContext();
    const materialContext = use(BibleViewTitleMaterialContext);
    const title = useBibleItemRenderTitle(bibleItem);
    const fontSize = useBibleViewFontSizeContext();
    return (
        <span
            className="title"
            style={{ fontSize }}
            title={
                materialContext !== null ? 'Double click to edit' : undefined
            }
            onDoubleClick={() => {
                if (materialContext !== null) {
                    materialContext.onDBClick(bibleItem);
                }
            }}
        >
            {title}
        </span>
    );
}

function handleVersesSelecting(event: any) {
    const currentTarget = event.currentTarget;
    const classList = currentTarget.classList;
    if (classList.contains('selected')) {
        classList.remove('selected');
    } else {
        currentTarget.parentElement?.childNodes.forEach((element: any) => {
            element.classList.remove('selected');
        });
        classList.add('selected');
        bringDomToNearestView(currentTarget);
    }
}

export const BIBLE_VIEW_TEXT_CLASS = 'bible-view-text';

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
            style={{ fontSize: `${fontSize}px`, paddingBottom: '100px' }}
        >
            {result.map(([verse, text]) => {
                return (
                    <Fragment key={verse}>
                        <div className="verse-number">
                            <div>{verse}</div>
                        </div>
                        <div
                            className="verse-text"
                            onClick={handleVersesSelecting}
                            onDoubleClick={handleToViewBringing}
                        >
                            {text}
                        </div>
                    </Fragment>
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
