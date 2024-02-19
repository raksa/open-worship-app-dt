import BibleItem from '../bible-list/BibleItem';
import { useStateSettingNumber } from '../helper/settingHelper';
import RenderVerseOptions from './RenderVerseOptions';
import RenderActionButtons from './RenderActionButtons';
import {
    BibleViewText, BibleViewTitle,
} from '../read-bible/BibleViewExtra';

export default function RenderBibleDataFound({
    bibleItem, onVerseChange,
}: Readonly<{
    bibleItem: BibleItem,
    onVerseChange?: (verseStart?: number, verseEnd?: number) => void,
}>) {
    const [fontSize, setFontSize] = useStateSettingNumber(
        'bible-search-font-size', 16,
    );
    const isSearching = onVerseChange !== undefined;
    return (
        <div className='card border-success mt-1 w-100 h-100'
            style={{
                height: '10px',
            }}>
            {renderHeader(bibleItem)}
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
                        fontSize={fontSize}
                        isEnableContextMenu />
                </div>
            </div>
            <div className='card-footer'>
                {renderFontSizeController(fontSize, setFontSize)}
            </div>
        </div>
    );
}

function renderHeader(
    bibleItem: BibleItem,
) {
    return (
        <div className='card-header bg-transparent border-success'>
            <div className='d-flex w-100 h-100' style={{
                overflowX: 'auto',
            }}>
                <div className='flex-fill text-nowrap'>
                    <BibleViewTitle bibleItem={bibleItem} />
                </div>
                <div>
                    <RenderActionButtons bibleItem={bibleItem} />
                </div>
            </div>
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
