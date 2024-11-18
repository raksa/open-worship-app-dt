import { useState } from 'react';

export default function OpacitySlider({ value, onOpacityChanged }: Readonly<{
    value: number,
    onOpacityChanged: (value: number, event: MouseEvent) => void,
}>) {
    const [localValue, setLocalValue] = useState(value || 1);
    return (
        <input type='range' value={localValue}
            className='form-range'
            step='1'
            min='0' max='255' onChange={(event) => {
                setLocalValue(parseInt(event.target.value, 10));
            }}
            onMouseUp={(event) => {
                onOpacityChanged(localValue, event as any);
            }} />
    );
}
