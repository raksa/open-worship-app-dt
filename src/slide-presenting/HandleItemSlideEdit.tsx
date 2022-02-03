import { useState } from "react";
import { useWindowEvent } from "../event/WindowEventListener";
import SlideItemEditorPopup, {
    closeItemSlideEditEvent, openItemSlideEditEvent
} from "../editor/SlideItemEditorPopup";
import { SlideItemThumbType } from "../editor/slideType";

export default function HandleItemSlideEdit() {
    const [slideItemThumb, setSlideItemThumb] = useState<SlideItemThumbType | null>(null);
    useWindowEvent(openItemSlideEditEvent, (item: SlideItemThumbType | null) => setSlideItemThumb(item));
    useWindowEvent(closeItemSlideEditEvent, () => setSlideItemThumb(null));
    return slideItemThumb ? <SlideItemEditorPopup slideItemThumb={slideItemThumb} /> : null;
}
