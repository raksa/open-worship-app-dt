import { useState } from 'react';
import { copyToClipboard } from '../server/appHelper';
import { bookToKey } from '../helper/bible-helpers/bibleInfoHelpers';
import BibleItem from '../bible-list/BibleItem';
import {
    consumeStartVerseEndVerse,
} from '../bible-list/bibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useStateSettingNumber } from '../helper/settingHelper';
import RenderVersesOption from './RenderVersesOption';
import RenderActionButtons from './RenderActionButtons';
import {
    BibleViewText, BibleViewTitle,
} from '../read-bible/BibleViewExtra';

type RendPropsType = {
    book: string,
    chapter: number,
    startVerse: number | null,
    endVerse: number | null,
    applyChapterSelection: (chapter: number) => void,
    onVerseChange: (startVerse?: number, endVerse?: number) => void,
    bibleSelected: string,
};

async function buildBibleItem({
    book, chapter, startVerse, endVerse, bibleSelected,
}: RendPropsType) {
    const found = await consumeStartVerseEndVerse({
        book, chapter, startVerse, endVerse, bibleSelected,
    });
    if (found === null) {
        return null;
    }
    const bookKey = await bookToKey(bibleSelected, book);
    if (bookKey === null) {
        return null;
    }
    const sVerse = found.sVerse;
    const eVerse = found.eVerse;
    return BibleItem.fromJson({
        id: -1,
        bibleKey: bibleSelected,
        target: {
            book: bookKey,
            chapter,
            startVerse: sVerse,
            endVerse: eVerse,
        },
        metadata: {},
    });
};

export default function RenderBibleDataFound(props: RendPropsType) {
    const [fontSize, setFontSize] = useStateSettingNumber(
        'bible-search-font-size', 16,
    );
    const [bibleItem, setBibleItem] = useState<BibleItem | null>(null);
    useAppEffect(() => {
        buildBibleItem(props).then((newBibleItem) => {
            setBibleItem(newBibleItem);
        });
    }, [props]);
    if (bibleItem === null) {
        return (
            <div>
                No Bible Item Found
            </div>
        );
    }
    return (
        <div className='card border-success mt-1 flex-fill' style={{
            height: '10px',
        }}>
            {renderHeader(bibleItem)}
            <div className={'card-body bg-transparent '
                + 'border-success p-0'}>
                <RenderVersesOption
                    bibleItem={bibleItem}
                    onVersesChange={props.onVerseChange}
                />
                <BibleViewText bibleItem={bibleItem}
                    fontSize={fontSize} />
            </div>
            <div className='card-footer'>
                {renderFontSizeController(fontSize, setFontSize)}
            </div>
        </div>
    );
}

function renderHeader(bibleItem: BibleItem) {
    return (
        <div className='card-header bg-transparent border-success'>
            <div className='d-flex'>
                <div className='flex-fill'>
                    <BibleViewTitle bibleItem={bibleItem} />
                </div>
                <div>
                    <RenderActionButtons bibleItem={bibleItem} />
                    <RenderCopyButton bibleItem={bibleItem} />
                </div>
            </div>
        </div>
    );
}

function RenderCopyButton({ bibleItem }: { bibleItem: BibleItem }) {
    return (
        <div className='btn-group float-end'>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy title to clipboard'
                onClick={() => {
                    bibleItem.toTitle().then((title) => {
                        copyToClipboard(title);
                    });
                }}><i className='bi bi-back ' />title</button>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy verse text to clipboard'
                onClick={() => {
                    bibleItem.toText().then((text) => {
                        copyToClipboard(text);
                    });
                }}>
                <i className='bi bi-back' />text</button>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy all to clipboard'
                onClick={() => {
                    Promise.all([
                        bibleItem.toTitle(),
                        bibleItem.toText(),
                    ]).then(([title, text]) => {
                        copyToClipboard(`${title}\n${text}`);
                    });
                }}><i className='bi bi-back' />all</button>
        </div>
    );
}

function renderFontSizeController(
    fontSize: number, setFontSize: (fontSize: number) => void,
) {
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
