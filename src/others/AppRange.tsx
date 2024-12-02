export type AppRangeDefaultType = {
    size: number,
    min: number,
    max: number,
    step: number,
};

export function wheelToScaleThumbnailSize(
    defaultSize: AppRangeDefaultType, isUp: boolean, currentScale: number,
) {
    let newScale = currentScale + (isUp ? 1 : -1) * defaultSize.step;
    if (newScale < defaultSize.min) {
        newScale = defaultSize.min;
    }
    if (newScale > defaultSize.max) {
        newScale = defaultSize.max;
    }
    return newScale;
}

export default function AppRange({
    value, title, id, setValue, defaultSize,
}: Readonly<{
    value: number,
    title: string,
    id?: string,
    setValue: (newValue: number) => void,
    defaultSize: AppRangeDefaultType,
}>) {
    const currentValue = Math.min(
        defaultSize.max, Math.max(defaultSize.min, value),
    ).toFixed(1);
    return (
        <div className='form form-inline d-flex flex-row-reverse'
            title={title}
            style={{ minWidth: '100px' }}>
            <label className='form-label'>
                {currentValue}
            </label>
            <input id={id} type='range' className='form-range'
                min={defaultSize.min} max={defaultSize.max}
                step={defaultSize.step}
                value={currentValue}
                onWheel={(event) => {
                    setValue(wheelToScaleThumbnailSize(
                        defaultSize, event.deltaY > 0, value,
                    ));
                }}
                onChange={(event) => {
                    setValue(parseInt(event.target.value, 10));
                }}
            />
        </div>
    );
}
