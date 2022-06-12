import { useState } from 'react';
import { useWindowEvent } from '../event/WindowEventListener';
import SlideItemEditorPopup, {
    closeItemSlideEditEvent, openItemSlideEditEvent,
} from '../editor/SlideItemEditorPopup';
import SlideItemThumb from './SlideItemThumb';

export default function HandleItemSlideEdit() {
    const [slideItemThumb, setSlideItemThumb] = useState<SlideItemThumb | null>(null);
    useWindowEvent(openItemSlideEditEvent, (item: SlideItemThumb | null) => setSlideItemThumb(item));
    useWindowEvent(closeItemSlideEditEvent, () => setSlideItemThumb(null));
    return slideItemThumb ? <SlideItemEditorPopup slideItemThumb={slideItemThumb} /> : null;
}
