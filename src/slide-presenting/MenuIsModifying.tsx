import { useState, useEffect } from 'react';
import {
    keyboardEventListener,
} from '../event/KeyboardEventListener';
import Slide from '../slide-list/Slide';

export default function MenuIsModifying({ slide, eventMapper }: {
    slide: Slide, eventMapper: any,
}) {
    const [isModifying, setIsModifying] = useState(false);
    useEffect(() => {
        slide.isModifying().then(setIsModifying);
    });
    if (!isModifying) {
        return null;
    }
    return (
        <button type="button" className="btn btn-sm btn-success tool-tip tool-tip-fade"
            data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
            title="save slide thumbs"
            onClick={() => {
                slide.save();
            }}>Save</button>
    );
}
