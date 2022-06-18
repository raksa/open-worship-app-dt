import { useState, useEffect } from 'react';
import {
    keyboardEventListener,
} from '../event/KeyboardEventListener';
import SlideItemsController from './SlideItemsController';

export default function MenuIsModifying({ controller, eventMapper }: {
    controller: SlideItemsController, eventMapper: any,
}) {
    const [isModifying, setIsModifying] = useState(false);
    useEffect(() => {
        controller.isModifying().then(setIsModifying);
    });
    if (!isModifying) {
        return null;
    }
    return (
        <button type="button" className="btn btn-sm btn-success tool-tip tool-tip-fade"
            data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
            title="save slide thumbs"
            onClick={() => {
                controller.save();
            }}>Save</button>
    );
}
