import { useState } from 'react';
import { useWindowEvent } from '../event/WindowEventListener';
import SlideItemEditorPopup, {
    closeItemSlideEditEvent, openItemSlideEditEvent,
} from '../editor/SlideItemEditorPopup';
import SlideItem from './SlideItem';

export default function HandleItemSlideEdit() {
    const [slideItemThumb, setSlideItemThumb] = useState<SlideItem | null>(null);
    useWindowEvent(openItemSlideEditEvent, (item: SlideItem | null) => setSlideItemThumb(item));
    useWindowEvent(closeItemSlideEditEvent, () => setSlideItemThumb(null));
    return slideItemThumb ? <SlideItemEditorPopup slideItemThumb={slideItemThumb} /> : null;
}
