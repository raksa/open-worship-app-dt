import { useState } from 'react';
import { useWindowEvent } from '../event/WindowEventListener';
import SlideItemEditorPopup, {
    closeItemSlideEditEvent, openItemSlideEditEvent,
} from '../slide-editor/SlideItemEditorPopup';
import SlideItem from './SlideItem';

export default function HandleItemSlideEdit() {
    const [slideItem, setSlideItem] = useState<SlideItem | null>(null);
    useWindowEvent(openItemSlideEditEvent, (item: SlideItem | null) => setSlideItem(item));
    useWindowEvent(closeItemSlideEditEvent, () => setSlideItem(null));
    return slideItem ? <SlideItemEditorPopup slideItem={slideItem} /> : null;
}
