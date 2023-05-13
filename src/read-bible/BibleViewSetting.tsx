import ButtonAddMoreBible from './ButtonAddMoreBible';
import BibleItem from '../bible-list/BibleItem';

export default function BibleViewSetting({
    fontSize, setFontSize, bibleItems, applyPresents,
}: {
    fontSize: number,
    setFontSize: (fontSize: number) => void,
    bibleItems: BibleItem[],
    applyPresents: (bibleItems: BibleItem[]) => void,
}) {
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
                    <ButtonAddMoreBible bibleItems={bibleItems}
                        applyPresents={applyPresents} />
                </div>
            </div>
        </div>
    );
}
