import { useState } from 'react';
import ReadingBibleController from './ReadingBibleController';
import { useReadingBibleEvents } from './readingBibleHelper';

export default function ReadingBiblePreviewer() {
    const readingBibleController = ReadingBibleController.getInstance();
    const [bibleItems, setBibleItems] = useState(
        readingBibleController.bibleItems);
    useReadingBibleEvents(['reload'], () => {
        setBibleItems(readingBibleController.bibleItems);
    });
    if (bibleItems.length === 0) {
        return emptyBibleReadingView();
    }
    return (
        <div className='card h-100'>
            <div className='card-body d-flex d-flex-row overflow-hidden h-100'>
                {bibleItems.map((item, i) => {
                    return (
                        <div key={i} className='flex-fill'>
                            {item.map((bibleItem, j) => {
                                return (
                                    <div key={j}>
                                        {bibleItem.bibleKey}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <div className='card-footer p-0'>
                <BibleViewSetting />
            </div>
        </div>
    );
}

function emptyBibleReadingView() {
    return (
        <div className='card h-100'>
            <div className='card-body d-flex d-flex-row overflow-hidden h-100'>
                <div className='flex-fill'>
                    <div className='d-flex justify-content-center align-items-center h-100'>
                        No Bible Available
                    </div>
                </div>
            </div>
        </div>
    );
}

function BibleViewSetting() {
    const readingBibleController = ReadingBibleController.getInstance();
    const _fontSize = readingBibleController.fontSize;
    const [fontSize, setFontSize] = useState(_fontSize);
    useReadingBibleEvents(['font-size-change'], () => {
        setFontSize(readingBibleController.fontSize);
    });
    return (
        <div className='bible-view-setting'>
            <div className='input-group d-flex'>
                <div className='flex-fill d-flex mx-1'>
                    <div className='pe-1'>
                        <label htmlFor="preview-fon-size"
                            className="form-label">
                            Font Size ({fontSize}px):
                        </label>
                    </div>
                    <div className='flex-fill'>
                        <input id="preview-fon-size"
                            type='range' className='form-range'
                            min={10} max={100} step={2}
                            value={fontSize}
                            onChange={(event) => {
                                setFontSize(Number(event.target.value));
                            }} />
                    </div>
                </div>
                <div className='px-2'>
                    +
                </div>
            </div>
        </div>
    );
}