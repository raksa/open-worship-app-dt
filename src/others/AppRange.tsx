export type AppRangeDefaultType = {
    size: number,
    min: number,
    max: number,
    step: number,
};

export default function AppRange({
    currentSize, setCurrentSize, defaultSize,
}: Readonly<{
    currentSize: number,
    setCurrentSize: (size: number) => void,
    defaultSize: AppRangeDefaultType,
}>) {
    return (
        <div className='form form-inline d-flex flex-row-reverse'
            style={{ minWidth: '100px' }}>
            <label className='form-label'>
                Size:{currentSize.toFixed(1)}
            </label>
            <input type='range' className='form-range'
                min={defaultSize.min} max={defaultSize.max}
                step={defaultSize.step}
                value={currentSize.toFixed(1)}
                onChange={(event) => {
                    setCurrentSize(parseInt(event.target.value, 10));
                }}
            />
        </div>
    );
}
