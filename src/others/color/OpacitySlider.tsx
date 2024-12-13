import { useState } from 'react';
import AppRange from '../AppRange';

export default function OpacitySlider({ value, onOpacityChanged }: Readonly<{
    value: number,
    onOpacityChanged: (value: number, event: MouseEvent) => void,
}>) {
    const [localValue, setLocalValue] = useState(value || 1);
    return (
        <AppRange
            value={localValue}
            title='Opacity'
            setValue={(newValue) => {
                setLocalValue(newValue);
                onOpacityChanged(newValue, {} as any);
            }}
            defaultSize={{
                size: localValue,
                min: 0,
                max: 255,
                step: 1,
            }}
        />
    );
}
