import { useState } from 'react';

export type AppRangeDefaultType = {
    size: number;
    min: number;
    max: number;
    step: number;
};

export function wheelToRangeValue({
    defaultSize,
    isUp,
    currentScale,
}: {
    defaultSize: AppRangeDefaultType;
    isUp: boolean;
    currentScale: number;
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
    event,
    value,
    setValue,
    defaultSize,
}: {
    event: any;
    value: number;
    setValue: (newValue: number) => void;
    defaultSize: AppRangeDefaultType;
}) {
    if (!event.ctrlKey) {
        return;
    }
    const newValue = wheelToRangeValue({
        defaultSize,
        isUp: event.deltaY > 0,
        currentScale: value,
    });
    setValue(newValue);
}

function roundSize(value: number, defaultSize: AppRangeDefaultType) {
    return Math.min(defaultSize.max, Math.max(defaultSize.min, value));
}

export default function AppRangeComp({
    value,
    title,
    id,
    setValue,
    defaultSize,
    isShowValue,
}: Readonly<{
    value: number;
    title: string;
    id?: string;
    setValue: (newValue: number) => void;
    defaultSize: AppRangeDefaultType;
    isShowValue?: boolean;
}>) {
    const [localValue, setLocalValue] = useState(roundSize(value, defaultSize));
    const setLocalValue1 = (newValue: number) => {
        newValue = roundSize(newValue, defaultSize);
        setLocalValue(newValue);
        setValue(newValue);
    };
    if (defaultSize.max <= defaultSize.min) {
        throw new Error(
            'max must be greater than min value, ' +
                JSON.stringify(defaultSize),
        );
    }
    return (
        <div
            className="form form-inline d-flex mx-2"
            title={title}
            style={{ minWidth: '100px' }}
        >
            <div
                className="pointer"
                onClick={() => {
                    setLocalValue1(localValue - defaultSize.step);
                }}
            >
                -
            </div>
            <input
                id={id}
                type="range"
                className="form-range"
                min={defaultSize.min}
                max={defaultSize.max}
                step={defaultSize.step}
                value={localValue}
                onWheel={(event) => {
                    setLocalValue1(
                        wheelToRangeValue({
                            defaultSize,
                            isUp: event.deltaY > 0,
                            currentScale: localValue,
                        }),
                    );
                }}
                onChange={(event) => {
                    setLocalValue1(parseInt(event.target.value));
                }}
            />
            <div
                className="pointer"
                onClick={() => {
                    setLocalValue1(localValue + defaultSize.step);
                }}
            >
                +
            </div>
            {isShowValue ? (
                <label
                    className="form-label"
                    style={{
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    :{localValue}
                </label>
            ) : null}
        </div>
    );
}
