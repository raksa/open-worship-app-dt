import { useState } from 'react';

export default function OpacitySlider({ value, onOpacityChanged }: {
    value: number,
    onOpacityChanged: (value: number, event: MouseEvent) => void,
}) {
    const [localValue, setLocalValue] = useState(value ?? 1);
    return (
        <input type='range' value={localValue}
            className='form-range'
            step='1'
            min='0' max='255' onChange={(event) => {
                setLocalValue(+event.target.value);
            }}
            onMouseUp={(event) => {
                onOpacityChanged(localValue, event as any);
            }} />
    );
}
