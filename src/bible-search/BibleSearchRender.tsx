import { useEffect, useState } from 'react';
import {
    KeyEnum, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import InputHandler from './InputHandler';
import RenderBookOption from './RenderBookOption';
import RenderChapterOption from './RenderChapterOption';
import Header from './Header';
import RenderFound from './RenderFound';
import {
    ExtractedBibleResult,
    defaultExtractedBible,
    extractBible,
    toInputText,
} from '../bible-helper/helpers2';
import Preview from './Preview';
import {
    getChapterCount,
    getBookKVList,
} from '../bible-helper/helpers1';
import BibleItem from '../bible-list/BibleItem';
import { closeBibleSearch } from './HandleBibleSearch';
import {
    useGetDefaultInputText,
    useGetSelectedBibleItem,
    getSelectedEditingBibleItem,
} from './bibleHelpers';

async function genInputText(preBible: string,
    bibleName: string, inputText: string) {
    const result = await extractBible(preBible, inputText);
    const {
        book: newBook,
        chapter: newChapter,
        startVerse: newStartVerse,
        endVerse: newEndVerse,
    } = result;
    if (newBook !== null) {
        const bookObj = await getBookKVList(preBible);
        const key = bookObj === null ? null : Object.keys(bookObj).find((k) => {
            return bookObj[k] === newBook;
        });
        if (key) {
            const newBookObj = await getBookKVList(bibleName);
            if (newBookObj !== null) {
                return toInputText(bibleName, newBookObj[key],
                    newChapter, newStartVerse, newEndVerse);
            }
        }
    }
    return '';
}

export default function BibleSearchRender({ bibleItem }: {
    bibleItem: BibleItem | null,
}) {
    const [inputText, setInputText] = useGetDefaultInputText(bibleItem);
    const [bibleSelected, setBibleSelected] = useGetSelectedBibleItem(bibleItem);
    useKeyboardRegistering({ key: KeyEnum.Escape }, () => {
        !inputText && closeBibleSearch();
    });
    const [bibleResult, setBibleResult] = useState<ExtractedBibleResult>(
        defaultExtractedBible);
    useEffect(() => {
        if (bibleSelected !== null) {
            extractBible(bibleSelected, inputText).then((result) => {
                setBibleResult(result);
            });
        }
    }, [bibleSelected, inputText]);
    if (bibleSelected === null) {
        return (
            <BibleNotAvailable />
        );
    }
    const {
        book, chapter,
        startVerse, endVerse,
    } = bibleResult;
    const applyBookSelection = async (newBook: string) => {
        const count = await getChapterCount(bibleSelected, newBook);
        if (count !== null) {
            setInputText(await toInputText(bibleSelected, newBook));
            return;
        }
        alert('Fail to generate input text');
    };
    const applyChapterSelection = async (newChapter: number) => {
        setInputText(`${await toInputText(bibleSelected, book, newChapter)}:`);
    };
    const applyVerseSelection = async (newStartVerse?: number, newEndVerse?: number) => {
        const txt = await toInputText(bibleSelected, book, chapter,
            newStartVerse, newEndVerse);
        setInputText(txt);
    };
    const handleBibleChange = async (preBible: string) => {
        const bibleName = await getSelectedEditingBibleItem(null);
        if (bibleName === null) {
            return;
        }
        setBibleSelected(bibleName);
        const newText = await genInputText(preBible, bibleName, inputText);
        if (newText !== null) {
            setInputText(newText);
        }
    };

    return (
        <div id='bible-search-popup'
            className='app-modal shadow card'>
            <Header />
            <div className='body card-body w-100'>
                <div className='input-group'>
                    <span className='input-group-text'>
                        <i className='bi bi-search'></i>
                    </span>
                    <InputHandler
                        inputText={inputText}
                        onInputChange={setInputText}
                        bibleSelected={bibleSelected}
                        onBibleChange={handleBibleChange} />
                </div>
                <div className='found'>
                    {!book && <RenderBookOption
                        bibleSelected={bibleSelected}
                        inputText={inputText}
                        onSelect={applyBookSelection}
                    />}
                    {book && chapter === null && <RenderChapterOption
                        bibleSelected={bibleSelected}
                        bookSelected={book}
                        inputText={inputText}
                        onSelect={applyChapterSelection}
                    />}
                    {book && chapter !== null && <RenderFound
                        bibleSelected={bibleSelected}
                        book={book}
                        chapter={chapter}
                        startVerse={startVerse}
                        endVerse={endVerse}
                        applyChapterSelection={applyChapterSelection}
                        onVerseChange={(newStartVerse, newEndVerse) => {
                            applyVerseSelection(newStartVerse, newEndVerse);
                        }}
                    />}
                    {book && chapter !== null && <Preview
                        bibleSelected={bibleSelected}
                        book={book}
                        chapter={chapter}
                        startVerse={startVerse}
                        endVerse={endVerse}
                    />}
                </div>
            </div>
        </div>
    );
}

function BibleNotAvailable() {
    return (
        <div id='bible-search-popup' className='app-modal shadow card'>
            <Header />
            <div className='body card-body w-100'>
                Bible not available!
            </div>
        </div>
    );
}
