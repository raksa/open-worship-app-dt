import { useMemo, useRef, useState } from 'react';

import { createMouseEvent } from '../../context-menu/appContextMenuHelpers';
import { AppColorType } from './colorHelpers';
import { useAppEffect } from '../../helper/debuggerHelpers';
import { genTimeoutAttempt } from '../../helper/helpers';

export default function SelectCustomColor({
    color,
    onColorSelected,
}: Readonly<{
    color: AppColorType | null;
    onColorSelected: (color: AppColorType, event: MouseEvent) => void;
}>) {
    const attemptTimeout = useMemo(() => {
        return genTimeoutAttempt(500);
    }, []);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localColor, setLocalColor] = useState(
        (color || '#ffffff').substring(0, 7) as AppColorType,
    );
    const applyColor = (newColor: AppColorType) => {
        setLocalColor(newColor);
        let fakeEvent = createMouseEvent(0, 0);
        if (inputRef.current !== null) {
            fakeEvent = createMouseEvent(
                inputRef.current.offsetLeft,
                inputRef.current.offsetLeft,
            );
        }
        onColorSelected(newColor, fakeEvent);
    };
    const setLocalColor1 = (newColor: string) => {
        attemptTimeout(() => {
            applyColor(newColor as AppColorType);
        });
    };
    useAppEffect(() => {
        if (color) {
            setLocalColor(color.substring(0, 7) as AppColorType);
        } else {
            setLocalColor('#ffffff' as AppColorType);
        }
    }, [color]);
    return (
        <>
            <span>`Mix Color: </span>
            <input
                ref={inputRef}
                title="Select custom color"
                className="pointer"
                type="color"
                value={localColor}
                onChange={(event) => {
                    setLocalColor1(event.target.value as any);
                }}
            />
        </>
    );
}
