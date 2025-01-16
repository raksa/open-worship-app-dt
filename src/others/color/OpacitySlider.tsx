import { useState } from 'react';
import AppRangeComp from '../AppRangeComp';

export default function OpacitySlider({
    value,
    onOpacityChanged,
}: Readonly<{
    value: number;
    onOpacityChanged: (value: number, event: MouseEvent) => void;
}>) {
    const [localValue, setLocalValue] = useState(value || 1);
    return (
        <AppRangeComp
            value={localValue}
            title="Opacity"
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
