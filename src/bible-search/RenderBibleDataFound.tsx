import BibleItem from '../bible-list/BibleItem';
import { useStateSettingNumber } from '../helper/settingHelper';
import RenderVerseOptions from './RenderVerseOptions';
import RenderActionButtons from './RenderActionButtons';
import {
    BibleViewText, BibleViewTitle,
} from '../read-bible/BibleViewExtra';

export default function RenderBibleDataFound({
    bibleItem, onVerseChange, onPinning,
}: {
    bibleItem: BibleItem,
    onVerseChange?: (startVerse?: number, endVerse?: number) => void,
    onPinning: () => void,
}) {
    const [fontSize, setFontSize] = useStateSettingNumber(
        'bible-search-font-size', 16,
    );
    const isSearching = onVerseChange !== undefined;
    return (
        <div className='card border-success mt-1 w-100 h-100'
            style={{
                height: '10px',
            }}>
            {renderHeader(bibleItem, isSearching, onPinning)}
            <div className={
                'card-body bg-transparent border-success p-0'
            }>
                {!isSearching ? null :
                    <RenderVerseOptions
                        bibleItem={bibleItem}
                        onVersesChange={onVerseChange} />
                }
                <div className='p-2'>
                    <BibleViewText
                        bibleItem={bibleItem}
                        fontSize={fontSize} />
                </div>
            </div>
            <div className='card-footer'>
                {renderFontSizeController(fontSize, setFontSize)}
            </div>
        </div>
    );
}

function renderHeader(
    bibleItem: BibleItem, isSearching: boolean, onPinning: () => void,
) {
    return (
        <div className='card-header bg-transparent border-success'>
            <div className='d-flex w-100 h-100' style={{
                overflowX: 'auto',
            }}>
                <div className='flex-fill'>
                    <BibleViewTitle bibleItem={bibleItem} />
                </div>
                <div>
                    <RenderActionButtons bibleItem={bibleItem} />
                    {genCopyButtons(bibleItem)}
                    {genPinButton(isSearching, onPinning)}
                </div>
            </div>
        </div>
    );
}

function genCopyButtons(bibleItem: BibleItem) {
    return (
        <div className='btn-group'>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy title to clipboard'
                onClick={() => {
                    bibleItem.copyTitleToClipboard();
                }}><i className='bi bi-back ' />title</button>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy verse text to clipboard'
                onClick={() => {
                    bibleItem.copyTextToClipboard();
                }}>
                <i className='bi bi-back' />text</button>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Copy all to clipboard'
                onClick={() => {
                    bibleItem.copyToClipboard();
                }}><i className='bi bi-back' />all</button>
        </div>
    );
}

function genPinButton(
    isSearching: boolean, onClick: () => void,
) {
    return (
        <div className='btn-group float-end'>
            {isSearching ?
                <button type='button'
                    className='btn btn-sm btn-outline-warning'
                    title='Pin this verse'
                    onClick={onClick}>
                    <i className='bi bi-pin' />
                </button> :
                <button type='button'
                    className='btn btn-sm btn-outline-warning'
                    title='Pin this verse'
                    onClick={onClick}>
                    <i className='bi bi-x-lg' />
                </button>
            }
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
