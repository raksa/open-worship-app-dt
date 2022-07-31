import './SlideItemEditorPopup.scss';

import {
    KeyEnum, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import SlideItemEditorPopupHeader from './SlideItemEditorPopupHeader';
import {
    StateEnum, WindowEnum, windowEventListener,
} from '../event/WindowEventListener';
import Modal from '../others/Modal';
import SlideItem from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import { canvasController } from './canvas/CanvasController';

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

export default function SlideItemEditorPopup({ slideItem }: {
    slideItem: SlideItem
}) {
    useKeyboardRegistering({
        key: KeyEnum.Escape,
    }, closeItemSlideEdit);
    canvasController.init(slideItem);
    return (
        <Modal>
            <div id='slide-item-editor-popup'
                className='app-modal shadow card'>
                <SlideItemEditorPopupHeader />
                <div className='body card-body w-100'>
                    <SlideItemEditor slideItem={slideItem} />
                </div>
            </div>
        </Modal>
    );
}
