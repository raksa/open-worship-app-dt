import { useState } from 'react';
import { copyToClipboard } from '../server/appHelper';
import { toInputText } from '../helper/bible-helpers/serverBibleHelpers2';
import { bookToKey } from '../helper/bible-helpers/bibleInfoHelpers';
import BibleItem from '../bible-list/BibleItem';
import {
    ConsumeVerseType, consumeStartVerseEndVerse,
} from '../bible-list/bibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useStateSettingNumber } from '../helper/settingHelper';
import RenderVersesOption from './RenderVersesOption';
import RenderActionButtons from './RenderActionButtons';

export default function RenderBibleDataFound({
    book,
    chapter,
    startVerse,
    endVerse,
    applyChapterSelection,
    onVerseChange,
    bibleSelected,
}: {
    book: string,
    chapter: number,
    startVerse: number | null,
    endVerse: number | null,
    applyChapterSelection: (chapter: number) => void,
    onVerseChange: (startVerse?: number, endVerse?: number) => void,
    bibleSelected: string,
}) {
    const [found, setFound] = useState<ConsumeVerseType | null>(null);
    const [fontSize, setFontSize] = useStateSettingNumber(
        'bible-search-font-size', 16);
    const [rendered, setRendered] = useState<{
        title: string, text: string,
    } | null>(null);
    useAppEffect(() => {
        (async () => {
            const found = await consumeStartVerseEndVerse(book, chapter,
                startVerse, endVerse, bibleSelected);
            if (found === null) {
                setRendered(null);
                return;
            }
            setFound(found);
            const sVerse = found.sVerse;
            const eVerse = found.eVerse;
            const newTitle = await toInputText(
                bibleSelected, book, chapter, sVerse, eVerse);
            const newText = await BibleItem.bibleItemToText(BibleItem.fromJson({
                id: -1,
                bibleKey: bibleSelected,
                target: {
                    book: await bookToKey(bibleSelected, book) || '',
                    chapter,
                    startVerse: sVerse,
                    endVerse: eVerse,
                },
                metadata: {},
            }));
            if (newTitle !== null && newText !== null) {
                setRendered({ title: newTitle, text: newText });
            } else {
                setRendered(null);
            }
        })();
    }, [bibleSelected, book, chapter, startVerse, endVerse]);
    if (rendered === null) {
        return null;
    }
    const { title, text } = rendered;
    return (
        <div className='card border-success mt-1 flex-fill' style={{
            height: '10px',
        }}>
            {renderHeader({
                title, text, found, book,
                chapter, bibleSelected,
            })}
            <div className={'card-body bg-transparent '
                + 'border-success p-0'}>
                <RenderVersesOption
                    bibleSelected={bibleSelected}
                    book={book}
                    chapter={chapter}
                    startVerse={startVerse}
                    endVerse={endVerse}
                    applyChapterSelection={applyChapterSelection}
                    onVerseChange={onVerseChange}
                />
                {bibleTextPreview(text, fontSize)}
            </div>
            <div className='card-footer'>
                {renderFontSizeController(fontSize, setFontSize)}
            </div>
        </div>
    );
}

function renderHeader({
    title, text, found, book, chapter, bibleSelected,
}: {
    title: string, text: string,
    found: ConsumeVerseType | null,
    book: string, chapter: number,
    bibleSelected: string,
}) {
    return (
        <div className='card-header bg-transparent border-success'>
            <div className='d-flex'>
                <div className='flex-fill'>{title}</div>
                <div>
                    {found !== null && <RenderActionButtons found={found}
                        book={book} chapter={chapter}
                        bibleSelected={bibleSelected} />}
                    {renderCopyButton(title, text)}
                </div>
            </div>
        </div>
    );
}

function renderCopyButton(title: string, text: string) {
    return (
        <div className='btn-group float-end'>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy title to clipboard'
                onClick={() => {
                    copyToClipboard(title);
                }}><i className='bi bi-back ' />title</button>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy verse text to clipboard'
                onClick={() => {
                    copyToClipboard(text);
                }}>
                <i className='bi bi-back' />text</button>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy all to clipboard'
                onClick={() => {
                    copyToClipboard(`${title}\n${text}`);
                }}><i className='bi bi-back' />all</button>
        </div>
    );
}

function bibleTextPreview(text: string, fontSize: number) {
    return (
        <p className='p-3 app-selectable-text'
            style={{
                fontSize: `${fontSize}px`,
            }}>{text}</p>
    );
}

function renderFontSizeController(fontSize: number,
    setFontSize: (fontSize: number) => void) {
    return (
        <div className='form form-inline d-flex'
            style={{ minWidth: '100px' }}>
            <label className='form-label' style={{ width: '150px' }}>
                Font Size:{fontSize}px
            </label>
            <input type='range' className='form-range'
                min={10} max={120}
                step={2}
                value={fontSize}
                onChange={(event) => {
                    setFontSize(+event.target.value);
                }} />
        </div>
    );
}
