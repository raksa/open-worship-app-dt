import React, { Suspense, useState } from 'react';
import {
    StateEnum,
    useWindowEvent,
    WindowEnum,
    windowEventListener,
} from '../event/WindowEventListener';
import SlideItem from '../slide-list/SlideItem';

const SlideItemEditorPopup = React.lazy(() => {
    return import('../slide-editor/SlideItemEditorPopup');
});

export const openItemSlideEditEvent = {
    window: WindowEnum.ItemSlideEdit,
    state: StateEnum.Open,
};
export const closeItemSlideEditEvent = {
    window: WindowEnum.ItemSlideEdit,
    state: StateEnum.Close,
};
export function openItemSlideEdit(slideItem: SlideItem) {
    windowEventListener.fireEvent(openItemSlideEditEvent, slideItem);
}
export function closeItemSlideEdit() {
    windowEventListener.fireEvent(closeItemSlideEditEvent);
}

export default function HandleItemSlideEdit() {
    const [slideItem, setSlideItem] = useState<SlideItem | null>(null);
    useWindowEvent(openItemSlideEditEvent, (item: SlideItem | null) => {
        return setSlideItem(item);
    });
    useWindowEvent(closeItemSlideEditEvent, () => {
        setSlideItem(null);
    });
    if (slideItem === null) {
        return null;
    }
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SlideItemEditorPopup slideItem={slideItem} />
        </Suspense>
    );
}
