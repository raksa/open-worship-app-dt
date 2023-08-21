export default function BibleViewSetting({
    fontSize, setFontSize,
    minFontSize, maxFontSize, stepFontSize,
}: {
    minFontSize: number,
    maxFontSize: number,
    stepFontSize: number,
    fontSize: number,
    setFontSize: (fontSize: number) => void,
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
                            min={minFontSize} max={maxFontSize}
                            step={stepFontSize}
                            value={fontSize}
                            onChange={(event) => {
                                setFontSize(Number(event.target.value));
                            }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
