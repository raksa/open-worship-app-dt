import { copyToClipboard } from '../server/appHelper';
import { toInputText } from '../server/bible-helpers/helpers2';
import { consumeStartVerseEndVerse } from './RenderFound';
import { useEffect, useState } from 'react';
import { bookToKey } from '../server/bible-helpers/helpers1';
import BibleItem from '../bible-list/BibleItem';

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
    const [rendered, setRendered] = useState<{ title: string, text: string } | null>(null);
    useEffect(() => {
        (async () => {
            const found = await consumeStartVerseEndVerse(book, chapter,
                startVerse, endVerse, bibleSelected);
            if (found === null) {
                setRendered(null);
                return;
            }
            const sVerse = found.sVerse;
            const eVerse = found.eVerse;
            const newTitle = await toInputText(bibleSelected, book, chapter, sVerse, eVerse);
            const newText = await BibleItem.itemToText(BibleItem.fromJson({
                id: -1,
                bibleName: bibleSelected,
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
        <div className='card border-success mb-3 mx-auto mt-5'
            style={{ maxHeight: '375px' }}>
            <div className='card-header bg-transparent border-success'>
                {title}
                <div className='btn-group float-end'>
                    <button type='button' className='btn btn-sm btn-outline-danger'
                        onClick={() => {
                            copyToClipboard(title);
                        }}>copy title</button>
                    <button type='button' className='btn btn-sm btn-outline-success'
                        onClick={() => {
                            copyToClipboard(text);
                        }}>copy verse text</button>
                    <button type='button' className='btn btn-sm btn-outline-info'
                        onClick={() => {
                            copyToClipboard(`${title}\n${text}`);
                        }}>copy all</button>
                </div>
            </div>
            <div className='card-body bg-transparent border-success select-text'>
                {text}
            </div>
        </div>
    );
}
