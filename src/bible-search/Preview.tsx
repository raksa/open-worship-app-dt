import { copyToClipboard } from '../server/appHelper';
import { toInputText } from '../server/bible-helpers/bibleHelpers2';
import { useState } from 'react';
import { bookToKey } from '../server/bible-helpers/bibleInfoHelpers';
import BibleItem from '../bible-list/BibleItem';
import { consumeStartVerseEndVerse } from './bibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useStateSettingNumber } from '../helper/settingHelper';

export default function Preview({
    book,
    chapter,
    startVerse,
    endVerse,
    bibleSelected,
}: {
    book: string,
    chapter: number,
    startVerse: number | null,
    endVerse: number | null,
    bibleSelected: string,
}) {
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
            const sVerse = found.sVerse;
            const eVerse = found.eVerse;
            const newTitle = await toInputText(
                bibleSelected, book, chapter, sVerse, eVerse);
            const newText = await BibleItem.itemToText(BibleItem.fromJson({
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
            <div className='card-header bg-transparent border-success'>
                {title}
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
            </div>
            <div className={'card-body bg-transparent '
                + 'border-success selectable-text'}>
                <p style={{ fontSize: `${fontSize}px` }}>{text}</p>
            </div>
            <div className='card-footer'>
                {renderFontSizeController(fontSize, setFontSize)}
            </div>
        </div>
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
