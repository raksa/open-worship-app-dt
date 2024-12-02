export type AppRangeDefaultType = {
    size: number,
    min: number,
    max: number,
    step: number,
};

export function wheelToRangeValue({
    defaultSize, isUp, currentScale,
}: {
    defaultSize: AppRangeDefaultType,
    isUp: boolean,
    currentScale: number,
}) {
    let newScale = currentScale + (isUp ? 1 : -1) * defaultSize.step;
    if (newScale < defaultSize.min) {
        newScale = defaultSize.min;
    }
    if (newScale > defaultSize.max) {
        newScale = defaultSize.max;
    }
    return newScale;
}

export function handleCtrlWheel({
    event, value, setValue, defaultSize,
}: {
    event: any, value: number, setValue: (newValue: number) => void,
    defaultSize: AppRangeDefaultType,
}) {
    if (!event.ctrlKey) {
        return;
    }
    const newValue = wheelToRangeValue({
        defaultSize, isUp: event.deltaY > 0, currentScale: value,
    });
    setValue(newValue);
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
                    setValue(wheelToRangeValue({
                        defaultSize, isUp: event.deltaY > 0,
                        currentScale: value,
                    }));
                }}
                onChange={(event) => {
                    setValue(parseInt(event.target.value, 10));
                }}
            />
        </div>
    );
}
